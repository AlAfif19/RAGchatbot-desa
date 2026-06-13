from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dev_script_runs_api_web_and_wa_connector_with_cleanup():
    script = ROOT / "scripts" / "dev.ps1"

    assert script.exists()
    content = script.read_text(encoding="utf-8")

    assert "Start-ManagedProcess \"api\"" in content
    assert "Start-ManagedProcess \"web\"" in content
    assert "Start-ManagedProcess \"wa-connector\"" in content
    assert "WA_CONNECTOR_URL" in content
    assert "NEXT_PUBLIC_API_URL" in content
    assert "API_BASE_URL" in content
    assert "PUPPETEER_EXECUTABLE_PATH" in content
    assert "Register-EngineEvent PowerShell.Exiting" in content
    assert "Stop-ManagedProcesses" in content
    assert "[int]$RunSeconds = 0" in content


def test_dev_script_uses_windows_powershell_compatible_process_arguments():
    script = ROOT / "scripts" / "dev.ps1"
    content = script.read_text(encoding="utf-8")

    assert "ArgumentList.Add" not in content
    assert "$startInfo.Arguments" in content


def test_dev_script_uses_windows_npm_command_shim():
    script = ROOT / "scripts" / "dev.ps1"
    content = script.read_text(encoding="utf-8")

    assert 'Start-ManagedProcess "web" "cmd.exe"' in content
    assert 'Start-ManagedProcess "wa-connector" "cmd.exe"' in content
    assert '"/c", "npm"' in content


def test_dev_script_stops_if_a_managed_process_exits():
    script = ROOT / "scripts" / "dev.ps1"
    content = script.read_text(encoding="utf-8")

    assert "Where-Object { $_.HasExited }" in content
    assert "Dev service exited unexpectedly" in content


def test_dev_script_checks_ports_before_starting_services():
    script = ROOT / "scripts" / "dev.ps1"
    content = script.read_text(encoding="utf-8")

    assert "Assert-PortAvailable" in content
    assert "Port $Port is already in use" in content
    assert "Assert-PortAvailable $ApiPort" in content
    assert "Assert-PortAvailable $WebPort" in content
    assert "Assert-PortAvailable $WaPort" in content


def test_dev_script_stops_descendant_process_tree():
    script = ROOT / "scripts" / "dev.ps1"
    content = script.read_text(encoding="utf-8")

    assert "Get-DescendantProcessIds" in content
    assert "foreach ($childId in Get-DescendantProcessIds $process.Id)" in content
