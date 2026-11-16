using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

// Closing the supervisor-owned job handle terminates every Next process.
public static partial class SoilSenseDevJob
{
    private static void Check(bool success)
    {
        if (!success) throw new Win32Exception(Marshal.GetLastWin32Error());
    }

    // CommandLineToArgvW escaping: preserve spaces, quotes and trailing slashes.
    private static string Quote(string value)
    {
        var quoted = new StringBuilder("\"");
        int slashes = 0;
        foreach (char character in value)
        {
            if (character == '\\') { slashes++; continue; }
            quoted.Append('\\', character == '"' ? slashes * 2 + 1 : slashes);
            quoted.Append(character);
            slashes = 0;
        }
        quoted.Append('\\', slashes * 2);
        return quoted.Append('"').ToString();
    }

    public static int Run(string[] command, int[] owners)
    {
        var ownerHandles = new List<IntPtr>();
        IntPtr job = IntPtr.Zero;
        var process = new ProcessInfo();
        bool assigned = false;
        ConsoleCancelEventHandler cancel = null;
        try
        {
            foreach (int owner in owners)
            {
                IntPtr handle = OpenProcess(0x00100000, false, owner); // SYNCHRONIZE
                Check(handle != IntPtr.Zero);
                ownerHandles.Add(handle);
            }
            job = CreateJobObject(IntPtr.Zero, null);
            Check(job != IntPtr.Zero);
            var limits = new ExtendedLimits();
            limits.Basic.LimitFlags = 0x2000; // JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
            Check(SetInformationJobObject(job, 9, ref limits, (uint)Marshal.SizeOf(limits)));

            var startup = new StartupInfo();
            startup.Size = (uint)Marshal.SizeOf(startup);
            startup.Flags = 0x100; // STARTF_USESTDHANDLES: retain npm's terminal.
            startup.StdInput = GetStdHandle(-10);
            startup.StdOutput = GetStdHandle(-11);
            startup.StdError = GetStdHandle(-12);
            var arguments = new List<string>();
            foreach (string argument in command) arguments.Add(Quote(argument));
            // Suspend until assigned so even early Next workers belong to the job.
            Check(CreateProcess(command[0], new StringBuilder(string.Join(" ", arguments)), IntPtr.Zero, IntPtr.Zero, true, 4, IntPtr.Zero, null, ref startup, out process));
            Check(AssignProcessToJobObject(job, process.Process));
            assigned = true;
            cancel = delegate(object sender, ConsoleCancelEventArgs e) { e.Cancel = true; TerminateJobObject(job, 0); };
            Console.CancelKeyPress += cancel;
            Check(ResumeThread(process.Thread) != uint.MaxValue);

            var handles = new List<IntPtr> { process.Process };
            handles.AddRange(ownerHandles);
            uint result = WaitForMultipleObjects((uint)handles.Count, handles.ToArray(), false, uint.MaxValue);
            Check(result != uint.MaxValue);
            if (result != 0) return 0; // The launching shell or npm process exited.
            uint exitCode;
            Check(GetExitCodeProcess(process.Process, out exitCode));
            return (int)exitCode;
        }
        finally
        {
            if (cancel != null) Console.CancelKeyPress -= cancel;
            if (process.Process != IntPtr.Zero && !assigned) TerminateProcess(process.Process, 1);
            if (job != IntPtr.Zero) CloseHandle(job);
            if (process.Thread != IntPtr.Zero) CloseHandle(process.Thread);
            if (process.Process != IntPtr.Zero) CloseHandle(process.Process);
            foreach (IntPtr handle in ownerHandles) CloseHandle(handle);
        }
    }
}
