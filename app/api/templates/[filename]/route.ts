import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Allowed template files
    const allowedTemplates = [
      'model-inventory.docx',
      'data-map.docx',
      'vendor-register.docx',
      'dpia-lite.docx',
      'policy-brief.docx'
    ];

    if (!allowedTemplates.includes(filename)) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Read the template file
    const filePath = join(process.cwd(), 'public', 'templates', filename);
    const fileBuffer = await readFile(filePath);

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error serving template:', error);
    return NextResponse.json({ error: 'Failed to serve template' }, { status: 500 });
  }
}

