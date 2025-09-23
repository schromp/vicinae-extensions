import { List, ActionPanel, Action, showToast, Icon, getPreferenceValues, Toast } from '@vicinae/api';
import { exec } from 'child_process';
import { readdir } from 'fs/promises';
import { useEffect, useState } from 'react';

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

export default function SimpleList() {
  const path: string = getPreferenceValues().wallpaperPath;
  const transitionType: string = getPreferenceValues().transitionType;

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    showToast(Toast.Style.Failure, path);
    
    readdir(path)
      .then(files => files.filter(file => 
        IMAGE_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))
      ))
      .then(setImages)
      .catch(() => {
        showToast(Toast.Style.Failure, 'Failed to read directory or no images found');
      })
  }, []);

  function setWallpaper(image: string) {
    const fullPath: string = `${path}/${image}`;
    exec(`swww img "${fullPath}" -t ${transitionType}`, (error) => {
      if (error) {
        showToast(Toast.Style.Failure, 'Failed to set wallpaper' + fullPath);
      } else {
        showToast(Toast.Style.Success, 'Wallpaper set!');
      }
    });
  }

  return (
    <List searchBarPlaceholder='Set wallpaper...' >
      <List.Section title={'Available Images'}>
        {images.map(image => (
          <List.Item 
            key={image} 
            title={image} 
            actions={
              <ActionPanel>
                <Action title="Set as wallpaper" icon={Icon.Cog} onAction={() => setWallpaper(image)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
