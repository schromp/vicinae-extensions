import { showToast, clearSearchBar, Toast } from '@vicinae/api';
import { exec } from 'node:child_process';

interface Arguments {
  value: string;
}

export default async function NoView(props: { arguments: Arguments }) {
	await clearSearchBar();

  await showToast({ title: `Debug: arguments are ${JSON.stringify(props)}` });
  const match = props.arguments.value.match(/^([+-]?)(\d+(\.\d+)?|\.\d+)$/);

  if (!match) {
    await showToast({ style: Toast.Style.Failure, title: "Invalid format", message: "Use e.g. 50" });
    return;
  }

  const prefix = match[1] || null;
  const percent = parseInt(match[2], 10) / 100;

  if (percent < 0 || percent > 150) {
    await showToast({ style: Toast.Style.Failure, title: "Volume must be 0-100%" });
    return;
  }

  const value = percent / 100;
  exec(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${prefix ? percent + prefix : percent}`, (error) => {
    if (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to set volume" });
    } else {
      showToast({ style: Toast.Style.Success, title: `Volume set to ${percent}%` });
    }
  });
}
