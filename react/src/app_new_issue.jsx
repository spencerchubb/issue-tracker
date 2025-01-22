import { useState } from 'react';
import { supabase } from './supabase';
import { AuthWrapper, useAuthWrapper } from './AuthWrapper';
import { MarkdownEditor } from './components/MarkdownEditor';

function App() {
  const authWrapperHook = useAuthWrapper();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function fetchData(session) {
    authWrapperHook.setUser(session?.user);
  }

  return <AuthWrapper fetchData={fetchData} authWrapperHook={authWrapperHook}>
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 700 }}>
      <p style={{ marginTop: 16 }}>Title</p>
      <input
        type="text"
        placeholder="Title"
        style={{ marginTop: 4 }}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <p style={{ marginTop: 16 }}>Description</p>
      <div style={{ marginTop: 4 }}></div>
      <MarkdownEditor
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Write description in Markdown"
      />
      <button
        style={{ marginTop: 8, alignSelf: 'flex-end' }}
        className="btnPrimary"
        onClick={async () => {
          const { data: issueData, error: issueError } = await supabase.from('issues').insert({
            title,
            author_id: authWrapperHook.user.id,
          }).select();

          if (issueError) {
            console.error('Error creating issue:', issueError);
            return;
          }

          // Create the first message for this issue
          const { error: messageError } = await supabase.from('messages').insert({
            issue_id: issueData[0].id,
            uid: authWrapperHook.user.id,
            content: description,
          });

          if (messageError) {
            console.error('Error creating message:', messageError);
          } else {
            console.log('Issue and message created successfully');
          }
        }}
      >
        Create
      </button>
    </div>
  </AuthWrapper>
}

export default App
