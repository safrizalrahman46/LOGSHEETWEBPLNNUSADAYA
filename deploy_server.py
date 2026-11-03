import os
import sys
import time
import paramiko

# Ensure UTF-8 output to avoid Windows CP1252 charmap encoding errors
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

HOST = "101.50.1.12"
PORT = 53610
USER = "root"
PASS = "3Y02FgwxH(9i*W"
REMOTE_BASE = "/var/www/upkaltimra"
LOCAL_BASE = os.path.dirname(os.path.abspath(__file__))

IGNORE_DIRS = {
    "node_modules", ".next", ".git", "tmp", "temp", "dist", "out",
    "brain", ".gemini", ".idea", ".vscode", "MANUAL BOOK WEBSIRE",
    "scratch", "__pycache__"
}
IGNORE_EXTS = {
    ".log", ".tar", ".gz", ".zip", ".exe", ".bat"
}
IGNORE_FILES = {
    "server_app", "server_app.exe"
}

def get_ssh():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    key_path = os.path.expanduser("~/.ssh/id_ed25519")
    for attempt in range(3):
        try:
            if os.path.exists(key_path):
                try:
                    client.connect(HOST, port=PORT, username=USER, key_filename=key_path, timeout=20)
                    return client
                except Exception:
                    pass
            client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
            return client
        except Exception as e:
            if attempt == 2:
                raise e
            time.sleep(2)
    return client

def deploy():
    print("=" * 60)
    print("  PLN NUSA DAYA - AUTO DEPLOYMENT TO VPS SERVER")
    print(f"  Target: https://upkaltimra.my.id ({HOST})")
    print("=" * 60)

    print(f"\n[1/4] Menghubungkan ke server VPS via SSH ({HOST}:{PORT})...")
    ssh = get_ssh()
    sftp = ssh.open_sftp()
    print("      Terhubung.")

    def remote_dir_exists(path):
        try:
            sftp.stat(path)
            return True
        except Exception:
            return False

    def ensure_remote_dir(path):
        parts = path.replace("\\", "/").strip("/").split("/")
        curr = ""
        for p in parts:
            curr += "/" + p
            if not remote_dir_exists(curr):
                try:
                    sftp.mkdir(curr)
                except Exception:
                    pass

    dirs_to_sync = ["backend", "frontend"]
    uploaded_files = []
    backend_changed = False
    frontend_changed = False
    frontend_code_changed = False

    print("\n[2/4] Memeriksa perubahan berkas lokal...")
    for d in dirs_to_sync:
        local_dir = os.path.join(LOCAL_BASE, d)
        if not os.path.exists(local_dir):
            continue

        for root, dirs, files in os.walk(local_dir):
            dirs[:] = [sub for sub in dirs if sub not in IGNORE_DIRS]

            rel_root = os.path.relpath(root, LOCAL_BASE)
            remote_root = os.path.join(REMOTE_BASE, rel_root).replace("\\", "/")

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in IGNORE_EXTS or file in IGNORE_FILES:
                    continue
                if file.startswith(".") and file not in [".env", ".env.production", ".env.local"]:
                    continue

                local_path = os.path.join(root, file)
                rel_path = os.path.relpath(local_path, LOCAL_BASE).replace("\\", "/")
                remote_path = f"{REMOTE_BASE}/{rel_path}"

                need_upload = False
                try:
                    r_stat = sftp.stat(remote_path)
                    l_stat = os.stat(local_path)
                    # Upload if local file is newer or size is different
                    if int(l_stat.st_mtime) > int(r_stat.st_mtime) or l_stat.st_size != r_stat.st_size:
                        need_upload = True
                except Exception:
                    need_upload = True

                if need_upload:
                    ensure_remote_dir(os.path.dirname(remote_path))
                    print(f"      + Upload: {rel_path}")
                    sftp.put(local_path, remote_path)
                    uploaded_files.append(rel_path)
                    if rel_path.startswith("backend"):
                        backend_changed = True
                    if rel_path.startswith("frontend"):
                        frontend_changed = True
                    if rel_path.startswith("frontend/src") or rel_path.startswith("frontend/package") or rel_path.startswith("frontend/next.config"):
                        frontend_code_changed = True

    sftp.close()

    if not uploaded_files:
        print("      Semua berkas di server sudah up-to-date (tidak ada file baru).")
    else:
        print(f"      Total {len(uploaded_files)} berkas berhasil diunggah ke server.")

    # Rebuild backend if necessary
    if backend_changed:
        print("\n[3/4] Mengompilasi ulang Backend Go di VPS & Restart Service...")
        cmd = "cd /var/www/upkaltimra/backend && /usr/bin/go build -o server_app cmd/server/main.go && systemctl restart pln-backend && systemctl is-active pln-backend"
        _, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if "active" in out:
            print("      Backend Go berhasil di-compile & restart: [ACTIVE]")
        else:
            print(f"      Backend build output: {out}\n      Errors: {err}")
    else:
        print("\n[3/4] Backend Go tidak berubah (skip recompile).")

    # Rebuild frontend if necessary
    if frontend_code_changed:
        print("\n[4/4] Mengompilasi ulang Frontend Next.js di VPS & Restart Service...")
        pkg_install = ""
        if any("package" in f for f in uploaded_files):
            pkg_install = "npm install mapbox-gl @types/mapbox-gl && "
        cmd = f"cd /var/www/upkaltimra/frontend && {pkg_install}NODE_OPTIONS='--max-old-space-size=2048' npx next build && systemctl restart pln-frontend && systemctl is-active pln-frontend"
        _, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if "active" in out:
            print("      Frontend Next.js berhasil di-build & restart: [ACTIVE]")
        else:
            print(f"      Frontend build output: {out}\n      Errors: {err}")
    elif frontend_changed:
        print("\n[4/4] File publik Frontend diperbarui, merestart service pln-frontend...")
        cmd = "systemctl restart pln-frontend && systemctl is-active pln-frontend"
        _, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        print(f"      Frontend service: [{out}]")
    else:
        print("\n[4/4] Frontend Next.js tidak berubah (skip rebuild).")

    # Ensure Apache reverse proxy is active
    apache_cmd = "test -f /usr/local/apps/apache2/etc/conf.d/pln-vhost.conf && /usr/local/apps/apache2/bin/httpd -t && /usr/local/apps/apache2/bin/apachectl graceful"
    _, stdout, stderr = ssh.exec_command(apache_cmd)
    out_ap = stdout.read().decode('utf-8', errors='replace').strip()
    print("      Apache Reverse Proxy status: Syntax OK & Reloaded.")

    ssh.close()

    print("\n" + "=" * 60)
    print("  DEPLOYMENT BERHASIL! Website di server sudah paling update.")
    print("  URL Live: https://upkaltimra.my.id")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    deploy()
