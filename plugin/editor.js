const { registerPlugin } = wp.plugins;
const { PluginSidebar } = wp.editPost;
const { TextControl, Button, PanelBody, Spinner } = wp.components;
const { useState } = wp.element;
const { dispatch } = wp.data;

const Sidebar = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handle = async () => {
    setLoading(true); setErr('');
    const res = await fetch(AI_GEN.proxy_url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ prompt })
    });
    const j = await res.json();
    if(j.summary){
      dispatch('core/editor').insertBlocks(
        wp.blocks.createBlock('core/paragraph',{ content: j.summary.replace(/\n/g,'<br>') })
      );
    } else setErr(j.error || 'No content');
    setLoading(false);
  };

  return (
    <PluginSidebar name="ai-gen-sidebar" title="AI Generator">
      <PanelBody initialOpen>
        <TextControl label="Prompt" value={prompt} onChange={setPrompt} />
        <Button isPrimary onClick={handle} disabled={loading} style={{marginTop:10}}>
          {loading ? <Spinner /> : 'Generate'}
        </Button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </PanelBody>
    </PluginSidebar>
  );
};

registerPlugin('ai-gen-plugin', { render: Sidebar });
