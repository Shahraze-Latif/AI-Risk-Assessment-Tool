export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} AI Risk Assessment Tool. All rights reserved.</p>
          <p className="mt-2">
            This tool provides general guidance only and should not be considered professional advice.
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-500">
            <p>Privacy: Responses are stored in Google Workspace; no production data required.</p>
            <p>Disclaimer: Informational, not legal advice.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
