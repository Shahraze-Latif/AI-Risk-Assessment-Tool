/**
 * === AI Compliance Readiness Report Generator — Client Spec Aligned (Final + Submission ID in Intake) ===
 * Flow:
 *   Form -> Intake / Scores / Plan -> Doc merge -> PDF saved -> (Frontend Stripe TEST) -> doGet email trigger
 * Highlights:
 *   - 12 questions -> 6 areas (0–3), L/M/H
 *   - Weighted overall (Gov 0.25, Data 0.20, Sec 0.20, Vendors 0.15, Human 0.10, Transp 0.10)
 *   - Fixed 30-Day Plan table (placeholders {{Task1}}..{{DueDate8}})
 *   - PDF name: Client_ReadinessCheck_YYYY-MM-DD.pdf (unique copy each run)
 *   - "Reports" sheet stores (submissionId, client, pdf link) for safe emailing after payment
 *   - ✅ Now also logs submissionId in Intake tab (first column)
 */

const SHEET_ID = PropertiesService.getScriptProperties().getProperty("SHEET_ID"); // Google Sheet
const TEMPLATE_ID = PropertiesService.getScriptProperties().getProperty("TEMPLATE_ID"); // Google Doc template
const OUTPUT_FOLDER_ID = PropertiesService.getScriptProperties().getProperty("OUTPUT_FOLDER_ID"); // Drive folder for PDFs
const INTERNAL_EMAIL = PropertiesService.getScriptProperties().getProperty("INTERNAL_EMAIL"); // internal email for notification

/* ─────────────── MANUAL TRIGGER MENU ─────────────── */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Reports")
    .addItem("Re-generate report", "runForSelectedRow")
    .addItem("Re-generate latest report", "runForLatestRow")
    .addToUi();
}

function runForSelectedRow() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reports");
    if (!sheet) {
      SpreadsheetApp.getUi().alert("Reports sheet not found. Please ensure the sheet exists.");
      return;
    }
    const activeRow = sheet.getActiveCell().getRow();
    if (activeRow <= 1) {
      SpreadsheetApp.getUi().alert("Please select a valid data row (not header row).");
      return;
    }
    const submissionId = sheet.getRange(activeRow, 2).getValue(); // Assuming submissionId is in column 2
    if (!submissionId) {
      SpreadsheetApp.getUi().alert("No submission ID found in the selected row.");
      return;
    }
    const response = SpreadsheetApp.getUi().alert(
      "Re-generate Report",
      `Are you sure you want to re-generate the report for submission ID: ${submissionId}?`,
      SpreadsheetApp.getUi().ButtonSet.YES_NO
    );
    if (response === SpreadsheetApp.getUi().Button.YES) generateReportFromRow(activeRow);

  } catch (err) {
    console.error('❌ runForSelectedRow error:', err);
    SpreadsheetApp.getUi().alert(`Error: ${err.message}`);
  }
}

function runForLatestRow() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reports");
    if (!sheet) {
      SpreadsheetApp.getUi().alert("Reports sheet not found. Please ensure the sheet exists.");
      return;
    }
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert("No data rows found in Reports sheet.");
      return;
    }
    const submissionId = sheet.getRange(lastRow, 2).getValue(); // Assuming submissionId is in column 2
    if (!submissionId) {
      SpreadsheetApp.getUi().alert("No submission ID found in the latest row.");
      return;
    }
    const response = SpreadsheetApp.getUi().alert(
      "Re-generate Latest Report",
      `Are you sure you want to re-generate the latest report for submission ID: ${submissionId}?`,
      SpreadsheetApp.getUi().ButtonSet.YES_NO
    );
    if (response === SpreadsheetApp.getUi().Button.YES) generateReportFromRow(activeRow);

  } catch (err) {
    console.error('❌ runForLatestRow error:', err);
    SpreadsheetApp.getUi().alert(`Error: ${err.message}`);
  }
}

/* ─────────────── ENTRY POINT (Form → Sheets → PDF) ─────────────── */

function doPost(e) {
  const submissionId = Utilities.getUuid();
  const clientName = e.parameter.ClientName || e.parameter.Company || 'Unknown Client';
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const intake = ss.getSheetByName('Intake');
    const scoresSheet = ss.getSheetByName('Scores');
    const plan = ss.getSheetByName('Plan');

    const formData = parseFormData(e.parameter);
    formData.SubmissionId = submissionId; // ✅ include submission ID for Intake

    appendToIntake(intake, formData);

    const qa = deriveQAFromIntake(formData);
    const areaScores = computeAreaScores(qa); 
    const labels = mapLabels(areaScores);
    const overall = computeWeightedOverall(areaScores);

    upsertScores(scoresSheet, areaScores);
    generatePlan(plan, formData, areaScores);

    const pdfResult = generatePDFReport(formData, areaScores, labels, overall);
    const pdfUrl = pdfResult.url;

    logOperation({
      submissionId,
      client: clientName,
      pdfLink: pdfUrl,
      status: 'success',
      errorMessage: ''
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', pdfUrl, submissionId })) // ✅ send submissionId
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error('❌ doPost error:', err);
    logOperation({
      submissionId,
      client: clientName,
      pdfLink: '',
      status: 'error',
      errorMessage: err.message
    });
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message, submissionId }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ─────────────── EMAIL TRIGGER (AFTER PAYMENT) ─────────────── */

function doGet(e) {
  const action = (e.parameter.action || '').toString();
  const submissionId = Utilities.getUuid();
  if (action === 'sendReportEmail') {
    const clientEmail = (e.parameter.clientEmail || '').toString();
    const clientName = (e.parameter.clientName || '').toString() || 'Client';
    try {
      if (!clientEmail) throw new Error('Missing clientEmail');
      const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
      const files = folder.getFiles();
      let latestFile = null;
      let latestTime = 0;
      while (files.hasNext()) {
        const f = files.next();
        if (f.getName().endsWith('.pdf')) {
          const t = f.getDateCreated().getTime();
          if (t > latestTime) { latestTime = t; latestFile = f; }
        }
      }
      if (!latestFile) throw new Error('No PDF found in folder');
      const pdfUrl = latestFile.getUrl();

      const subject = `AI Readiness Report – ${clientName}`;
      const body = `
        <p>Hello ${sanitize(clientName)},</p>
        <p>Thank you for your payment. Your AI Compliance Readiness Report is ready:</p>
        <p><a href="${pdfUrl}" target="_blank">📄 View or Download Report</a></p>
        <p>Best regards,<br>AI Risk Assessment Team</p>
      `;
      MailApp.sendEmail({ to: clientEmail, subject, htmlBody: body });
      MailApp.sendEmail({
        to: INTERNAL_EMAIL,
        subject: `Report sent to ${sanitize(clientName)}`,
        htmlBody: `<p>Report sent to ${clientEmail}.</p><p><a href="${pdfUrl}" target="_blank">View PDF</a></p>`
      });
      //logOperation({ submissionId, client: clientName, pdfLink: pdfUrl, status: 'success', errorMessage: '' });
      return ContentService.createTextOutput('Email sent successfully.').setMimeType(ContentService.MimeType.TEXT);
    } catch (err) {
      console.error('❌ sendReportEmail error:', err);
      //logOperation({ submissionId, client: clientName, pdfLink: '', status: 'error', errorMessage: err.message });
      return ContentService.createTextOutput('Error: ' + err.message).setMimeType(ContentService.MimeType.TEXT);
    }
  }
  return ContentService.createTextOutput('Invalid action');
}

/* ───────────────────────── Intake Handling ─────────────────────── */

function parseFormData(p) {
  return {
    Company: p.Company || '',
    Industry: p.Industry || '',
    UseCases: p.UseCases || '',
    DataCategories: p.DataCategories || '',
    ModelType: p.ModelType || '',
    PHI: p.PHI || p['PHI? (Yes/No)'] || '',
    EUUsers: p.EUUsers || p['EUUsers? (Yes/No)'] || '',
    Vendors: p.Vendors || '',
    Controls_MFA: p.Controls_MFA || '',  
    Controls_RBAC: p.Controls_RBAC || '',
    Controls_Encryption: p.Controls_Encryption || '',
    Controls_Logging: p.Controls_Logging || '',
    OversightLevel: p.OversightLevel || p.oversightLevel || p.oversight_level || p.human_in_loop || p.Human_Oversight || p.Oversight || '',
    Links: p.Links || '',
    Transparency_UserDisclosure: p.Transparency_UserDisclosure || '',
    Transparency_RecordKeeping: p.Transparency_RecordKeeping || '',
    ClientName: p.ClientName || '',
    ClientEmail: p.ClientEmail || ''
  };
}

/* ✅ Updated: append submissionId to Intake */
function appendToIntake(sheet, data) {
  // Expected headers
  const headers = [

    'Company','Industry','UseCases','DataCategories','ModelType',
    'PHI? (Yes/No)','EUUsers? (Yes/No)','Vendors',
    'Controls_MFA (Yes/No)','Controls_RBAC (Yes/No)',
    'Controls_Encryption (Yes/No)','Controls_Logging (Yes/No)',
    'OversightLevel (None/Pre/Real-time/Post)','Links',
    'Transparency_UserDisclosure','Transparency_RecordKeeping'
  ];

  // ✅ 1. Ensure header row exists
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  // ✅ 2. Verify "SubmissionId" column exists; if missing, add it as first column
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let submissionIdCol = headerRow.indexOf('SubmissionId') + 1;
  if (submissionIdCol === 0) {
    sheet.insertColumnBefore(1);
    sheet.getRange(1, 1).setValue('SubmissionId');
    submissionIdCol = 1;
  }

  // ✅ 3. Build row in the correct order
  const row = [
    data.Company || '',
    data.Industry || '',
    data.UseCases || '',
    data.DataCategories || '',
    data.ModelType || '',
    data.PHI || '',
    data.EUUsers || '',
    data.Vendors || '',
    data.Controls_MFA || '',
    data.Controls_RBAC || '',
    data.Controls_Encryption || '',
    data.Controls_Logging || '',
    data.OversightLevel || '',
    data.Links || '',
    data.Transparency_UserDisclosure || '',
    data.Transparency_RecordKeeping || '',
  ];

  // ✅ 4. Append row
  sheet.appendRow(row);

  // ✅ 5. Final safety: if sheet previously had SubmissionId as last column, fill it explicitly
  const lastRow = sheet.getLastRow();
  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const submissionIdColumn = currentHeaders.indexOf('SubmissionId') + 1;
  if (submissionIdColumn > 0) {
    sheet.getRange(lastRow, submissionIdColumn).setValue(data.SubmissionId || Utilities.getUuid());
  }
}




/* ───────────────────── Client QA → Scores ───────────────────── */

function deriveQAFromIntake(d) {
  const yesNo = (v) => (v || '').toString().trim().toLowerCase();
  const Q1 = pickBestOf(['owners','owner','product','security','legal'], d.Links + ' ' + d.UseCases)
    ? 'Partial' : (d.Links ? 'Partial' : 'No');
  const hasPolicyHint = pickBestOf(['policy','ai policy','model governance','standard','sop'], d.Links);
  const Q2 = hasPolicyHint ? 'Partial' : 'No';
  let Q3 = 'No';
  if (yesNo(d.PHI) === 'yes' || /phi|special/i.test(d.DataCategories)) Q3 = 'PHI or special categories';
  else if (/pii|personal/i.test(d.DataCategories)) Q3 = 'PII only';
  const eu = yesNo(d.EUUsers);
  const Q4 = eu === 'yes' ? 'Yes' : eu === 'no' ? 'No' : 'Unsure';
  const q5_mfa = yesNo(d.Controls_MFA) === 'yes';
  const q5_rbac = yesNo(d.Controls_RBAC) === 'yes';
  const Q5 = q5_mfa && q5_rbac ? 'Yes' : (q5_mfa || q5_rbac ? 'Partial' : 'No');
  const q6_enc = yesNo(d.Controls_Encryption) === 'yes';
  const q6_log = yesNo(d.Controls_Logging) === 'yes';
  const Q6 = q6_enc && q6_log ? 'Yes' : (q6_enc || q6_log ? 'Partial' : 'No');
  let Q7 = 'unknown';
  const v = d.Vendors || '';
  if (/multiple/i.test(v)) Q7 = 'Multiple';
  else if (/open\s*source|oss|self\-host/i.test(v)) Q7 = 'OSS';
  else if (/azure/i.test(v)) Q7 = 'OpenAI via Azure';
  else if (/openai|anthropic|gcp|aws|amazon|google|other us/i.test(v)) Q7 = 'Other US';
  const Q8 = inferYesPartialNo(d.Links, ['dpa','data processing','processor agreement','security terms']);
  const ol = (d.OversightLevel || '').toLowerCase();
  let Q9 = 'None';
  if (/pre/.test(ol)) Q9 = 'Pre-deployment';
  else if (/real/.test(ol)) Q9 = 'Real-time';
  else if (/post/.test(ol)) Q9 = 'Post-hoc';
  const Q10 = inferYesPartialNo(d.Links, ['rollback','incident','fallback','runbook']);
  const Q11 = normalizeYPN(d.Transparency_UserDisclosure);
  const Q12 = normalizeYPN(d.Transparency_RecordKeeping);
  return { Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11,Q12 };
}

function normalizeYPN(v) {
  const s = (v || '').toLowerCase();
  if (s.includes('yes')) return 'Yes';
  if (s.includes('partial') || s.includes('draft') || s.includes('unsure')) return 'Partial';
  if (s.includes('no')) return 'No';
  return 'Partial';
}

function inferYesPartialNo(haystack, keywords) {
  const t = (haystack || '').toLowerCase();
  if (!t) return 'No';
  let hits = 0;
  keywords.forEach(k => { if (t.includes(k)) hits++; });
  if (hits >= 2) return 'Yes';
  if (hits === 1) return 'Partial';
  return 'No';
}

function pickBestOf(words, txt) {
  const t = (txt || '').toLowerCase();
  return words.some(w => t.includes(w));
}

function scoreQ(id, val) {
  const v = (val || '').toLowerCase();
  if (id === 3) { if (v.includes('phi') || v.includes('special')) return 3; if (v.includes('pii')) return 1; return 0; }
  if (id === 7) { if (v.includes('azure')) return 1; if (v.includes('oss') || v.includes('open') || v.includes('multiple')) return 2; if (v.includes('unknown')) return 3; if (v.includes('other us')) return 2; }
  if (id === 9) { if (v.includes('pre') || v.includes('real')) return 0; if (v.includes('post')) return 2; if (v.includes('none')) return 3; }
  if (v.includes('yes')) return 0;
  if (v.includes('partial') || v.includes('unsure') || v.includes('draft')) return 2;
  if (v.includes('no')) return 3;
  return 2;
}

function computeAreaScores(qa) {
  const Governance = Math.round(((scoreQ(1, qa.Q1) + scoreQ(2, qa.Q2)) / 2));
  const Data = Math.round(((scoreQ(3, qa.Q3) + scoreQ(4, qa.Q4)) / 2));
  const Security = Math.round(((scoreQ(5, qa.Q5) + scoreQ(6, qa.Q6)) / 2));
  const Vendors = Math.round(((scoreQ(7, qa.Q7) + scoreQ(8, qa.Q8)) / 2));
  const HumanOversight = Math.round(((scoreQ(9, qa.Q9) + scoreQ(10, qa.Q10)) / 2));
  const Transparency = Math.round(((scoreQ(11, qa.Q11) + scoreQ(12, qa.Q12)) / 2));
  return { Governance, Data, Security, Vendors, HumanOversight, Transparency };
}

function mapLabels(areaScores) {
  const label = (s) => s <= 1 ? 'Low' : (s === 2 ? 'Medium' : 'High');
  const out = {};
  Object.keys(areaScores).forEach(k => out[k] = label(areaScores[k]));
  return out;
}

function computeWeightedOverall(areaScores) {
  const w = { Governance: 0.25, Data: 0.20, Security: 0.20, Vendors: 0.15, HumanOversight: 0.10, Transparency: 0.10 };
  const sum = (areaScores.Governance * w.Governance) + (areaScores.Data * w.Data) +
              (areaScores.Security * w.Security) + (areaScores.Vendors * w.Vendors) +
              (areaScores.HumanOversight * w.HumanOversight) + (areaScores.Transparency * w.Transparency);
  return Math.round(sum * 10) / 10;
}

/* ───────────────────────── Scores Sheet ─────────────────────── */

function upsertScores(sheet, areaScores) {
  const all = sheet.getDataRange().getValues();
  if (all.length === 0) {
    sheet.appendRow(['Area','Score_0to3','Weight_0to1','WeightedScore','Notes','Overall_0to3']);
  }
  const header = sheet.getDataRange().getValues()[0];
  const scoreCol = header.indexOf('Score_0to3') + 1;
  Object.keys(areaScores).forEach(area => {
    const row = findAreaRow(sheet, area);
    if (row > 0 && scoreCol > 0) sheet.getRange(row, scoreCol).setValue(areaScores[area]);
  });
}

function findAreaRow(sheet, areaName) {
  const data = sheet.getDataRange().getValues();
  const normalizedTarget = areaName.replace(/\s+/g, '').toLowerCase(); // remove spaces
  for (let i = 1; i < data.length; i++) {
    const cellValue = (data[i][0] || '').toString().replace(/\s+/g, '').toLowerCase();
    if (cellValue === normalizedTarget) return i + 1;
  }
  return -1;
}


/* ───────────────────────── Plan (5–8) ───────────────────────── */

function generatePlan(sheet, d, areaScores){
  const items = [];
  if (areaScores.Security>=2 && (d.Controls_MFA||'').toLowerCase()!=='yes')
    items.push(['Enable MFA and RBAC for all admin users','IT','S','High','Week 1']);
  if (areaScores.Vendors>=2 || !/\bdpa\b/i.test(d.Links||''))
    items.push(['Execute DPA with AI provider; review SOC2/ISO docs','Ops/Legal','M','High','Week 2']);
  if (areaScores.HumanOversight>=2)
    items.push(['Add real-time human review for escalations; define fallback','Product','M','High','Week 2']);
  if (areaScores.Data>=2 && (d.PHI||'').toLowerCase()==='yes')
    items.push(['Limit PHI in prompts; add redaction','Data','M','High','Week 3']);
  if (areaScores.Transparency>=2)
    items.push(['Add AI disclosure text in UI and Help Center','Product','S','Med','Week 1']);
  if (areaScores.Governance>=2)
    items.push(['Publish 1-page AI policy; assign RACI for approvals','Leadership','S','Med','Week 1']);

  if (items.length<5) items.push(['Conduct AI risk assessment review with stakeholders','Leadership','M','High','Week 4']);
  if (items.length<6) items.push(['Establish AI governance committee and meeting cadence','Leadership','M','Med','Week 3']);
  if (items.length>8) items.length = 8;

  const last=sheet.getLastRow();
  if (last===0) sheet.appendRow(['Task','Owner','Effort_S_M_L','Impact','DueDate']);
  if (sheet.getLastRow()>1) sheet.getRange(2,1,sheet.getLastRow()-1,5).clearContent();
  items.forEach(r=>sheet.appendRow(r));
}

/* ─────────────────────── Doc / PDF Merge ────────────────────── */

function generatePDFReport(formData, areaScores, labels, overall) {
  const copyName = `Client_ReadinessCheck_${new Date().toISOString().slice(0,10)}`;
  const copyFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy(copyName);
  const copyId = copyFile.getId();
  const doc = DocumentApp.openById(copyId);
  const body = doc.getBody();

  // Exec summary: top risks + quick wins
  const topRisks = Object.entries(areaScores)
    .filter(([_,s])=>s>=2).sort((a,b)=>b[1]-a[1]).map(([k,s])=>`${k} (${s}/3)`).slice(0,3).join(', ') || 'None';
  const quickWins = Object.entries(areaScores)
    .filter(([_,s])=>s<=1).map(([k,s])=>`${k} (${s}/3)`).join(', ') || 'None';

  const replacements = {
    ClientName: formData.ClientName || formData.Company || 'Client',
    ReportDate: new Date().toLocaleDateString(),
    TopRisks: topRisks,
    QuickWins: quickWins,

    // Heatmap L/M/H
    Governance_Level: labels.Governance,
    Data_Level: labels.Data,
    Security_Level: labels.Security,
    Vendors_Level: labels.Vendors,
    HumanOversight_Level: labels.HumanOversight,
    Transparency_Level: labels.Transparency,

    // Findings
    Governance_Why: textWhy('Governance'),
    Data_Why: textWhy('Data'),
    Security_Why: textWhy('Security'),
    Vendors_Why: textWhy('Vendors'),
    HumanOversight_Why: textWhy('HumanOversight'),
    Transparency_Why: textWhy('Transparency'),

    Governance_Findings: textFindings('Governance', areaScores, formData),
    Data_Findings: textFindings('Data', areaScores, formData),
    Security_Findings: textFindings('Security', areaScores, formData),
    Vendors_Findings: textFindings('Vendors', areaScores, formData),
    HumanOversight_Findings: textFindings('HumanOversight', areaScores, formData),
    Transparency_Findings: textFindings('Transparency', areaScores, formData),

    EU_AI_Act_101: euAIInsights(areaScores, formData),
    US_Healthcare_Lens: usHealthcareInsights(areaScores, formData)
  };

  Object.keys(replacements).forEach(k => {
    body.replaceText(`{{${k}}}`, String(replacements[k] || ''));
  });

  // 30-Day Plan placeholders
  fillPlanPlaceholders(doc);

  doc.saveAndClose();

// Export PDF and make it shareable
const tz = Session.getScriptTimeZone();
const formattedDate = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
const pdfName = `Client_ReadinessCheck_${formattedDate}.pdf`;
const pdfBlob = DriveApp.getFileById(copyId).getAs(MimeType.PDF);
const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
const pdfFile = folder.createFile(pdfBlob).setName(pdfName);

// Make the file viewable by anyone with the link
pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

return { url: pdfFile.getUrl(), id: pdfFile.getId(), name: pdfName };

}

/* ───────────── Fill static 8-row Plan placeholders ───────────── */

function fillPlanPlaceholders(doc) {
  const body = doc.getBody();
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const plan = ss.getSheetByName('Plan');
  const vals = plan.getDataRange().getValues().slice(1);
  const rows = vals.slice(0, 8);

  for (let i=0; i<8; i++) {
    const row = rows[i] || [' ',' ',' ',' ',' '];
    const [task, owner, effort, impact, dueDate] = row.map(x => x || ' ');
    const rep = {
      [`Task${i+1}`]: task,
      [`Owner${i+1}`]: owner,
      [`Effort${i+1}`]: effort,
      [`Impact${i+1}`]: impact,
      [`DueDate${i+1}`]: dueDate
    };
    Object.keys(rep).forEach(k => body.replaceText(`{{${k}}}`, rep[k]));
  }
}

/* ───────────── Findings text (Why + What we saw) ───────────── */

function textWhy(area) {
  switch (area) {
    case 'Governance':
      return 'Clear governance assigns accountability and aligns AI use with legal and ethical requirements.';
    case 'Data':
      return 'Managing sensitive data and jurisdictions (EU/UK) is critical for GDPR/HIPAA and privacy risk.';
    case 'Security':
      return 'Strong access, encryption, and logging reduce the likelihood and impact of breaches.';
    case 'Vendors':
      return 'Third-party AI providers introduce shared risk; contracts and reviews are essential.';
    case 'HumanOversight':
      return 'Human review and rollback plans prevent and correct harmful AI outcomes.';
    case 'Transparency':
      return 'Disclosure and record-keeping build user trust and support auditability.';
    default:
      return 'This area influences overall AI risk posture.';
  }
}

function textFindings(area, areaScores, d) {
  const s = areaScores[area];
  const high = s >= 3, med = s === 2;

  if (area === 'Governance') {
    if (high || med) return 'Limited policy maturity and/or unclear ownership for AI risk; define owners and publish a lightweight AI policy.';
    return 'Named owners and basic policy structure observed.';
  }
  if (area === 'Data') {
    if (high) return 'Use of PHI/special categories and/or EU data subjects requires enhanced safeguards and DPIA-style review.';
    if (med)  return 'Some sensitive data or EU/UK exposure; review classification and retention practices.';
    return 'No sensitive data detected; jurisdictional exposure appears limited.';
  }
  if (area === 'Security') {
    if (high || med) return 'Gaps in MFA/RBAC and/or encryption/logging; enable MFA, enforce RBAC, and ensure robust audit logs.';
    return 'Access controls, encryption, and logging are in place.';
  }
  if (area === 'Vendors') {
    if (high) return 'Multiple/OSS providers without consistent review; execute DPAs and validate vendor security certifications.';
    if (med)  return 'Mixed provider posture; prioritize contractual reviews and standardize vendor assessments.';
    return 'Single vetted provider with contractual protections in place.';
  }
  if (area === 'HumanOversight') {
    if (high || med) return 'Oversight is post-hoc or absent; add human-in-the-loop for escalations and document rollback/incident playbooks.';
    return 'Pre-deployment/real-time review and rollback planning observed.';
  }
  if (area === 'Transparency') {
    if (high || med) return 'Improve user disclosure around AI use and maintain a model inventory with change logs.';
    return 'Clear user disclosure and basic model inventory in place.';
  }
  return 'Assessment completed.';
}

/* ───────────────────── Appendix insights ───────────────────── */

function euAIInsights(areaScores, d) {
  const eu = (d.EUUsers || '').toLowerCase()==='yes';
  const parts = [];
  if (eu) {
    parts.push('EU/UK users detected → EU AI Act requirements apply (depending on use case risk class).');
    if (areaScores.Transparency>=2) parts.push('Focus: provider/user disclosures and record-keeping.');
    if (areaScores.HumanOversight>=2) parts.push('Focus: human-in-the-loop and incident response.');
  } else {
    parts.push('EU AI Act likely not directly applicable given no EU/UK users.');
  }
  return parts.join(' ');
}

function usHealthcareInsights(areaScores, d) {
  const phi = (d.PHI || '').toLowerCase()==='yes';
  const parts = [];
  if (phi) {
    parts.push('PHI present → HIPAA obligations apply to data handling and vendor BAAs.');
    if (areaScores.Data>=2) parts.push('Strengthen data minimization and de-identification.');
    if (areaScores.Security>=2) parts.push('Enforce MFA/RBAC, encryption in transit/at rest, and audit logging.');
  } else {
    parts.push('No PHI detected; healthcare obligations limited.');
  }
  return parts.join(' ');
}

/* ───────────────────── Reports sheet helpers ─────────────────── */

function ensureReportsSheet(ss) {
  let sh = ss.getSheetByName('Reports');
  if (!sh) {
    sh = ss.insertSheet('Reports');
    sh.appendRow(['timestamp','submissionId','client','pdfLink','status','errorMessage']);
  } else {
    // Check if headers exist and are correct
    const lastRow = sh.getLastRow();
    if (lastRow === 0) {
      // Empty sheet, add headers
      sh.appendRow(['timestamp','submissionId','client','pdfLink','status','errorMessage']);
    } else {
      // Check if headers match expected format (flexible matching)
      const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      const expectedHeaders = ['timestamp','submissionId','client','pdfLink','status','errorMessage'];
      
      // Normalize headers for comparison
      const normalizeHeader = (header) => (header || '').toString().toLowerCase().replace(/\s+/g, '');
      const normalizedHeaders = headers.map(normalizeHeader);
      const normalizedExpected = expectedHeaders.map(normalizeHeader);
      
      // Check if all expected headers are present
      const hasAllHeaders = normalizedExpected.every(expected => 
        normalizedHeaders.includes(expected)
      );
      
      if (!hasAllHeaders) {
        console.log('⚠️ Reports sheet headers do not match expected format. Adding new row with correct headers.');
        // Don't modify existing headers, just ensure we can work with what we have
      }
    }
  }
  return sh;
}

function recordReport(ss, rec) {
  const sh = ss.getSheetByName('Reports');
  if (!sh) throw new Error('Reports sheet missing');
  sh.appendRow([rec.submissionId, rec.clientName, rec.clientEmail, rec.pdfId, rec.pdfUrl, rec.createdAt]);
}

/**
 * Log operational details to the Reports sheet
 * @param {Object} logData - Object containing logging information
 * @param {string} logData.submissionId - Unique submission identifier
 * @param {string} logData.client - Client name
 * @param {string} logData.pdfLink - PDF file URL
 * @param {string} logData.status - Status of the operation (success/error)
 * @param {string} logData.errorMessage - Error message if status is error
 */
function logOperation(logData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ensureReportsSheet(ss);
    
    // Get current headers and find column positions
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    
    // Flexible column finding function
    const findColumnIndex = (targetColumn) => {
      const normalizedTarget = targetColumn.toLowerCase().replace(/\s+/g, '');
      for (let i = 0; i < headers.length; i++) {
        const normalizedHeader = (headers[i] || '').toString().toLowerCase().replace(/\s+/g, '');
        if (normalizedHeader === normalizedTarget) {
          return i;
        }
      }
      return -1;
    };
    
    // Find column positions
    const timestampCol = findColumnIndex('timestamp');
    const submissionIdCol = findColumnIndex('submissionId');
    const clientCol = findColumnIndex('client');
    const pdfLinkCol = findColumnIndex('pdfLink');
    const statusCol = findColumnIndex('status');
    const errorMessageCol = findColumnIndex('errorMessage');
    
    // Create a new row with the correct number of columns
    const newRow = new Array(headers.length).fill('');
    
    // Fill in the data at the correct column positions
    if (timestampCol >= 0) newRow[timestampCol] = new Date().toISOString();
    if (submissionIdCol >= 0) newRow[submissionIdCol] = logData.submissionId || '';
    if (clientCol >= 0) newRow[clientCol] = logData.client || '';
    if (pdfLinkCol >= 0) newRow[pdfLinkCol] = logData.pdfLink || '';
    if (statusCol >= 0) newRow[statusCol] = logData.status || 'unknown';
    if (errorMessageCol >= 0) newRow[errorMessageCol] = logData.errorMessage || '';
    
    sh.appendRow(newRow);
    
    // If there's an error, send email notification
    if (logData.status === 'error' && logData.errorMessage) {
      sendErrorNotification(logData);
    }
    
  } catch (err) {
    console.error('❌ Logging error:', err);
    // Try to send error notification even if logging fails
    try {
      sendErrorNotification({
        submissionId: logData.submissionId || 'unknown',
        client: logData.client || 'unknown',
        errorMessage: `Logging failed: ${err.message}. Original error: ${logData.errorMessage || 'unknown'}`
      });
    } catch (emailErr) {
      console.error('❌ Failed to send error notification:', emailErr);
    }
  }
}

/**
 * Send error notification email to mark@aiglobalinnovations.com
 * @param {Object} errorData - Error information
 */
function sendErrorNotification(errorData) {
  try {
    const subject = `AI Risk Assessment Tool - Error Report`;
    const body = `
      <h3>Error in AI Risk Assessment Tool</h3>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Submission ID:</strong> ${errorData.submissionId || 'Unknown'}</p>
      <p><strong>Client:</strong> ${errorData.client || 'Unknown'}</p>
      <p><strong>Error Message:</strong> ${errorData.errorMessage || 'Unknown error'}</p>
      <p><strong>Row ID:</strong> Check the Reports sheet for the latest entry</p>
      <hr>
      <p><em>This is an automated error notification from the AI Risk Assessment Tool.</em></p>
    `;
    
    MailApp.sendEmail({
      to: 'mark@aiglobalinnovations.com',
      subject: subject,
      htmlBody: body
    });
    
    console.log('✅ Error notification sent to mark@aiglobalinnovations.com');
    
  } catch (err) {
    console.error('❌ Failed to send error notification:', err);
  }
}

function lookupReportBySubmissionId(ss, submissionId) {
  const sh = ss.getSheetByName('Reports');
  if (!sh) return null;
  const values = sh.getDataRange().getValues();
  const header = values[0];
  
  // Flexible column matching - case insensitive and handles spaces
  const findColumnIndex = (targetColumn) => {
    const normalizedTarget = targetColumn.toLowerCase().replace(/\s+/g, '');
    for (let i = 0; i < header.length; i++) {
      const normalizedHeader = (header[i] || '').toString().toLowerCase().replace(/\s+/g, '');
      if (normalizedHeader === normalizedTarget) {
        return i;
      }
    }
    return -1;
  };
  
  const idx = {
    sub: findColumnIndex('submissionId'),
    name: findColumnIndex('client'),
    email: findColumnIndex('clientEmail'),
    id: findColumnIndex('pdfFileId'),
    url: findColumnIndex('pdfLink'),
    at: findColumnIndex('timestamp')
  };
  
  for (let i=1;i<values.length;i++){
    if (values[i][idx.sub] === submissionId) {
      return {
        submissionId: values[i][idx.sub],
        clientName: values[i][idx.name],
        clientEmail: values[i][idx.email],
        pdfId: values[i][idx.id],
        pdfUrl: values[i][idx.url],
        createdAt: values[i][idx.at]
      };
    }
  }
  return null;
}

function sanitize(s){ return (s||'').replace(/[<>]/g,''); }

/* ─────────────────────────── Test ──────────────────────────── */

/**
 * === Re-generate a report from an existing submissionId ===
 * Looks up the intake data for that submission, rebuilds the PDF,
 * and updates the Reports tab with the new PDF link and timestamp.
 */
/**
 * === Re-generate a report using the currently selected row in Reports tab ===
 * Reads all row data (client name, email, pdf link, etc.), rebuilds report PDF,
 * updates the link and timestamp in the same row.
 */
function generateReportFromRow(rowNumber) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const reports = ss.getSheetByName("Reports");
    const intake = ss.getSheetByName("Intake");
    const scores = ss.getSheetByName("Scores");
    const plan = ss.getSheetByName("Plan");

    if (rowNumber <= 1) throw new Error("Please select a valid data row (not header).");

    // 🧭 Read headers and the selected row
    const headers = reports.getRange(1, 1, 1, reports.getLastColumn()).getValues()[0];
    const rowData = reports.getRange(rowNumber, 1, 1, reports.getLastColumn()).getValues()[0];
    const dataMap = {};
    headers.forEach((h, i) => dataMap[h.toLowerCase().replace(/\s+/g, '')] = rowData[i]);

    const clientName = dataMap["client"] || "Client";
    const pdfLink = dataMap["pdflink"] || "";
    const submissionId = dataMap["submissionid"] || Utilities.getUuid();
    const clientEmail = dataMap["clientemail"] || "";

    // ⚙️ Try to find intake data if SubmissionId exists
    let formData = null;
    if (submissionId) {
      const intakeValues = intake.getDataRange().getValues();
      const intakeHeader = intakeValues[0];
      const idCol = intakeHeader.indexOf("SubmissionId");
      if (idCol > -1) {
        for (let i = 1; i < intakeValues.length; i++) {
          if (intakeValues[i][idCol] === submissionId) {
            formData = {};
            for (let j = 0; j < intakeHeader.length; j++) {
              formData[intakeHeader[j].replace(/\s+/g, "_")] = intakeValues[i][j];
            }
            break;
          }
        }
      }
    }

    // If no intake record, build a minimal one
    if (!formData) {
      formData = { ClientName: clientName, ClientEmail: clientEmail };
    }

    // 🧮 Compute new scores and generate new PDF
    const qa = deriveQAFromIntake(formData);
    const areaScores = computeAreaScores(qa);
    const labels = mapLabels(areaScores);
    const overall = computeWeightedOverall(areaScores);
    upsertScores(scores, areaScores);
    generatePlan(plan, formData, areaScores);

    const pdfMeta = generatePDFReport(formData, areaScores, labels, overall);

    // 🔄 Update Reports tab
    const headersNormalized = headers.map(h => h.toLowerCase().replace(/\s+/g, ''));
    const tsCol = headersNormalized.indexOf("timestamp") + 1;
    const pdfCol = headersNormalized.indexOf("pdflink") + 1;
    if (tsCol > 0) reports.getRange(rowNumber, tsCol).setValue(new Date().toISOString());
    if (pdfCol > 0) reports.getRange(rowNumber, pdfCol).setValue(pdfMeta.url);

    SpreadsheetApp.getUi().alert(`✅ Report re-generated for ${clientName}\n\nNew PDF:\n${pdfMeta.url}`);

  } catch (err) {
    console.error("❌ generateReportFromRow error:", err);
    SpreadsheetApp.getUi().alert(`Error re-generating report:\n${err.message}`);
  }
}




function testGenerate() {
  const sample = {
    ClientName:'Sample Client A',
    Company:'River Clinic',
    Industry:'Outpatient healthcare',
    UseCases:'Triage chatbot; claim-denial prediction pilot',
    DataCategories:'EHR (FHIR), claims, limited PHI; US-only',
    ModelType:'GPT-4 class LLM; XGBoost pilot',
    PHI:'Yes',
    EUUsers:'No',
    Vendors:'OpenAI via Azure; Amplitude',
    Controls_MFA:'Yes',
    Controls_RBAC:'Yes',
    Controls_Encryption:'Yes',
    Controls_Logging:'Partial',
    OversightLevel:'Pre-deployment',
    Links:'policy draft; DPA with Azure; rollback runbook',
    Transparency_UserDisclosure:'Partial',
    Transparency_RecordKeeping:'No',
    ClientEmail:'sample@example.com'
  };
  const submissionId = Utilities.getUuid();
  sample.SubmissionId = submissionId;

  const ss = SpreadsheetApp.openById(SHEET_ID);
  ensureReportsSheet(ss);

  appendToIntake(ss.getSheetByName('Intake'), sample);
  const qa = deriveQAFromIntake(sample);
  const areaScores = computeAreaScores(qa);
  const labels = mapLabels(areaScores);
  const overall = computeWeightedOverall(areaScores);

  upsertScores(ss.getSheetByName('Scores'), areaScores);
  generatePlan(ss.getSheetByName('Plan'), sample, areaScores);
  const pdfMeta = generatePDFReport(sample, areaScores, labels, overall);
  recordReport(ss, {
    submissionId,
    clientName: sample.ClientName,
    clientEmail: sample.ClientEmail,
    pdfId: pdfMeta.id,
    pdfUrl: pdfMeta.url,
    createdAt: new Date().toISOString()
  });
  Logger.log({submissionId, pdfMeta});
}



/* ─────────────── Helper ─────────────── */

function sanitize(s){ return (s||'').replace(/[<>]/g,''); }


//this one is old and good 