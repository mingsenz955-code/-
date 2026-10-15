using System;
using System.Diagnostics;
using System.IO;
using System.Linq;

// 御龙高手启动器
// 优先启动 dist 下版本号最新的打包版本；没有打包版本时退回源码树里的 electron。
static class Launcher
{
    [STAThread]
    static int Main(string[] args)
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string target = FindPackaged(root) ?? FindSource(root);
        if (target == null)
        {
            System.Windows.Forms.MessageBox.Show(
                "找不到可启动的游戏程序。\n\n请确认 dist 目录下有一个打包版本，或先执行 npm install。",
                "御龙高手",
                System.Windows.Forms.MessageBoxButtons.OK,
                System.Windows.Forms.MessageBoxIcon.Warning);
            return 1;
        }
        var start = new ProcessStartInfo(target)
        {
            UseShellExecute = true,
            WorkingDirectory = root
        };
        if (string.Equals(Path.GetFileName(target), "electron.exe", StringComparison.OrdinalIgnoreCase))
        {
            start.Arguments = "\"" + root.TrimEnd(Path.DirectorySeparatorChar) + "\"";
        }
        string save = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "YulongRanch", "saves", "ranch-v1.json");
        if (File.Exists(save)) start.Arguments = (start.Arguments ?? "") + " --require-player-save";
        start.Arguments = (start.Arguments ?? "") + " --verify-live";
        Directory.CreateDirectory(Path.Combine(root, "work"));
        File.WriteAllText(Path.Combine(root, "work", "launcher-target.txt"), "程序：" + target + "\r\n正式存档：" + save + "\r\n");
        if (args.Contains("--inspect")) return 0;
        // Different packaged versions share the same player save and application lock.
        // Close an older visible instance gracefully so it cannot intercept this launch.
        foreach (var old in Process.GetProcessesByName("御龙高手"))
        {
            try {
                if (old.MainWindowHandle == IntPtr.Zero) continue;
                string oldPath = old.MainModule.FileName;
                if (string.Equals(oldPath, target, StringComparison.OrdinalIgnoreCase)) continue;
                if (!oldPath.StartsWith(Path.Combine(root, "dist") + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) continue;
                if (!old.CloseMainWindow() || !old.WaitForExit(10000)) {
                    System.Windows.Forms.MessageBox.Show("旧版游戏仍在运行，请先正常关闭游戏后再启动。存档未被修改。", "御龙高手");
                    return 2;
                }
            } catch (System.ComponentModel.Win32Exception) { }
        }
        Process.Start(start);
        return 0;
    }

    static string FindPackaged(string root)
    {
        string dist = Path.Combine(root, "dist");
        if (!Directory.Exists(dist)) return null;
        return Directory.GetDirectories(dist, "御龙高手-v*-win32-x64")
            .Select(dir => new { Dir = dir, Exe = Path.Combine(dir, "御龙高手.exe") })
            .Where(item => File.Exists(item.Exe))
            .OrderByDescending(item => VersionOf(item.Dir))
            .Select(item => item.Exe)
            .FirstOrDefault();
    }

    static string FindSource(string root)
    {
        string electron = Path.Combine(root, "node_modules", "electron", "dist", "electron.exe");
        return File.Exists(electron) ? electron : null;
    }

    static Version VersionOf(string dir)
    {
        string name = Path.GetFileName(dir);
        int start = name.IndexOf("-v", StringComparison.Ordinal);
        int end = name.IndexOf("-win32", StringComparison.Ordinal);
        Version value = new Version(0, 0);
        if (start >= 0 && end > start) Version.TryParse(name.Substring(start + 2, end - start - 2), out value);
        return value ?? new Version(0, 0);
    }
}
