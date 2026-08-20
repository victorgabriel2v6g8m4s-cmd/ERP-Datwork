using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using ErpDatwork.Launcher.Domain;

namespace ErpDatwork.Launcher.Presentation
{
    internal static class StatusIconFactory
    {
        internal static Icon Create(Icon brandIcon, LauncherState state)
        {
            Color color = StateColor(state);
            using (Bitmap bitmap = new Bitmap(64, 64))
            using (Graphics graphics = Graphics.FromImage(bitmap))
            {
                graphics.SmoothingMode = SmoothingMode.AntiAlias;
                graphics.Clear(Color.Transparent);
                graphics.DrawIcon(brandIcon, new Rectangle(2, 2, 58, 58));
                using (SolidBrush shadow = new SolidBrush(Color.FromArgb(215, 20, 20, 20)))
                    graphics.FillEllipse(shadow, 37, 37, 27, 27);
                using (SolidBrush brush = new SolidBrush(color))
                    graphics.FillEllipse(brush, 41, 41, 19, 19);
                using (Pen border = new Pen(Color.White, 2.5f))
                    graphics.DrawEllipse(border, 41, 41, 19, 19);

                IntPtr handle = bitmap.GetHicon();
                try { return (Icon)Icon.FromHandle(handle).Clone(); }
                finally { DestroyIcon(handle); }
            }
        }

        private static Color StateColor(LauncherState state)
        {
            if (state == LauncherState.Online) return Color.FromArgb(45, 170, 82);
            if (state == LauncherState.Starting) return Color.FromArgb(231, 145, 34);
            if (state == LauncherState.Error) return Color.FromArgb(211, 52, 52);
            return Color.FromArgb(128, 128, 128);
        }

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern bool DestroyIcon(IntPtr handle);
    }
}
