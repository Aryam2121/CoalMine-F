import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const MyEditor = () => {
  const apiKey =import.meta.env.VITE_TINYMCE_API_KEY;

  return (
    <Editor
      apiKey={apiKey}
      init={{
        height: 200,
        menubar: false,
        plugins: 'link image code',
        toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
      }}
    />
  );
};

export default MyEditor;
