
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  height?: number;
}

const RichTextEditor = ({ value, onChange, label, height = 500 }: RichTextEditorProps) => {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="content">{label}</Label>}
      {!isReady && (
        <div className="flex items-center justify-center bg-gray-100 rounded-md" style={{ height: `${height}px` }}>
          <div className="text-gray-500">Chargement de l'éditeur...</div>
        </div>
      )}
      <Editor
        id="content"
        apiKey="no-api-key" // En production, utilisez une vraie clé API
        onInit={(evt, editor) => {
          editorRef.current = editor;
          setIsReady(true);
        }}
        initialValue={value}
        value={value}
        onEditorChange={(newContent) => onChange(newContent)}
        init={{
          height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image media | removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          image_advtab: true,
          images_upload_handler: (blobInfo, progress) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target) {
                  resolve(e.target.result as string);
                } else {
                  reject('Erreur lors de la lecture du fichier');
                }
              };
              reader.readAsDataURL(blobInfo.blob());
            });
          },
          language: 'fr_FR',
          language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/fr_FR.js',
          skin: "oxide",
          branding: false,
        }}
      />
    </div>
  );
};

export default RichTextEditor;
