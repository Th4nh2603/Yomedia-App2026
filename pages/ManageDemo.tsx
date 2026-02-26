import React from 'react';

type SftpStatus = {
  ok: boolean;
  message: string;
} | null;

const ManageDemo: React.FC = () => {
  const [testingSftp, setTestingSftp] = React.useState(false);
  const [sftpStatus, setSftpStatus] = React.useState<SftpStatus>(null);

  const handleTestSftp = async () => {
    setTestingSftp(true);
    setSftpStatus(null);

    try {
      const baseUrl =
        import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/sftp/connect`);
      const data = await response.json();

      if (response.ok && data.ok) {
        const message = `Connected to ${data.host}:${data.port}${
          data.cwd ? ` (cwd: ${data.cwd})` : ''
        }`;
        setSftpStatus({ ok: true, message });
      } else {
        setSftpStatus({
          ok: false,
          message: data.error || 'Unknown error',
        });
      }
    } catch (err) {
      setSftpStatus({
        ok: false,
        message:
          err instanceof Error ? err.message : 'Unknown network error',
      });
    } finally {
      setTestingSftp(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-[#e0e0e0] tracking-tight">
          Manage Demo
        </h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">
          Use this panel to verify connectivity to the SFTP server used for
          demo assets.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-[#1f2a40]/80 border border-[#3d465d] shadow-2xl flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[#e0e0e0]">
            SFTP Connection
          </h2>
          <p className="text-xs text-[#a3a3a3]">
            This will call the server endpoint <code>/api/sftp/connect</code>{' '}
            and report back the status.
          </p>
          <button
            onClick={handleTestSftp}
            disabled={testingSftp}
            className="mt-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#4cceac] text-[#141b2d] text-sm font-semibold hover:bg-[#6ee7c7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {testingSftp ? 'Testing SFTP…' : 'Test SFTP'}
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-[#0f172a] border border-white/5 text-xs text-[#a3a3a3] space-y-2">
          <p>
            Make sure your <code>apps/server</code> project is running and that
            the SFTP credentials in its <code>.env.local</code> file are valid.
          </p>
          <p>
            If the web client is served from a different origin, configure{' '}
            <code>VITE_SERVER_URL</code> in the web app environment to point to
            the server base URL.
          </p>
        </div>
      </div>

      {sftpStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div className="w-80 rounded-2xl bg-[#020617] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#4cceac]/10 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <div
                className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center ${
                  sftpStatus.ok
                    ? 'bg-[#4cceac]/20 text-[#4cceac]'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                <span className="text-lg">
                  {sftpStatus.ok ? '✓' : '!'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xs font-semibold text-white">
                      {sftpStatus.ok ? 'SFTP Connected' : 'SFTP Connection Failed'}
                    </h2>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      {sftpStatus.ok
                        ? 'Connection established successfully.'
                        : 'Unable to reach the SFTP endpoint.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSftpStatus(null)}
                    className="text-[#64748b] hover:text-white text-xs"
                    aria-label="Close notification"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-[#e5e7eb] break-words leading-relaxed">
                  {sftpStatus.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDemo;

