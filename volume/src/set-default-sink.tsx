import { List, Action, showToast, Toast, ActionPanel } from "@vicinae/api";
import { useEffect, useState } from "react";
import { exec } from "node:child_process";

export default function DefaultSinkList() {
  const [sinks, setSinks] = useState<{ id: string; name: string }[]>([]);
  const [defaultSinkId, setDefaultSinkId] = useState<string | null>(null);

  useEffect(() => {
    exec("pw-dump", (err, stdout) => {
      if (err) return;
      try {
        const objects = JSON.parse(stdout);
        const sinkList = objects
          .filter((obj: any) => obj.info?.props?.["media.class"] === "Audio/Sink")
          .map((s: any) => ({
            id: s.id,
            name: s.info.props["node.description"] || s.info.props["node.name"],
          }));
        setSinks(sinkList);
      } catch (e) {
        // Handle JSON parse error
      }
    });

    exec("wpctl get-default", (err, stdout) => {
      if (err) return;
      // stdout is like "Sink@123"
      const match = stdout.match(/Sink@(\d+)/);
      if (match) setDefaultSinkId(match[1]);
    });
  }, []);

  const setDefaultSink = (sinkId: string) => {
    exec(`wpctl set-default ${sinkId}`, (err) => {
      if (err) {
        showToast({ style: Toast.Style.Failure, title: "Failed to set default sink" });
      } else {
        showToast({ style: Toast.Style.Success, title: "Default sink set!" });
      }
    });
  };

  return (
    <List>
      {sinks.map(sink => (
        <List.Item 
          key={sink.id} 
          title={sink.name} 
          accessories={
            sink.id === defaultSinkId
              ? [{ text: "default" }]
              : [{text: "test"}]
          }
          actions={
            <ActionPanel>
              <Action title="Set as Default Sink" onAction={() => setDefaultSink(sink.id)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
