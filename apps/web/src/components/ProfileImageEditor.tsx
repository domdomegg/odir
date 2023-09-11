import { useEffect, useRef } from 'react';
import { useRawReq } from '../helpers/networking';
import { SectionTitle } from './Section';
import Button from './Button';

export const ProfileImageEditor: React.FC<{
  onComplete: (profileImageUri: string) => void
}> = ({ onComplete }) => {
  const req = useRawReq();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fileInputRef.current?.click();
  }, [fileInputRef.current]);

  return (
    <>
      <SectionTitle>Upload new profile image</SectionTitle>
      <div className="my-4">
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input type="file" className="py-2" accept="image/jpeg, image/png" capture="user" ref={fileInputRef} autoFocus />
      </div>
      <Button
        onClick={async () => {
          try {
            const file = fileInputRef.current?.files?.[0];
            if (!file) {
              throw new Error('No file selected');
            }

            if (file.size > 5_000_000) {
              throw new Error('The maximum file size you can upload is 5MB. Try compressing your image first.');
            }

            const dataUriBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  resolve(reader.result);
                } else {
                  throw new Error(`Invalid reader result type: ${typeof reader.result}`);
                }
              };
              reader.readAsDataURL(file);
            });

            const profileImageUri = (await req('post /admin/blobs', { data: dataUriBase64 })).data;
            onComplete(profileImageUri);
          } catch (error) {
            // TODO: better error display
            alert(error);
          }
        }}
      >Submit
      </Button>
    </>
  );
};
