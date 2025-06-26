<?php
/*
Plugin Name: AI Content Generator
Description: Tạo nội dung AI từ prompt hoặc tiêu đề, hỗ trợ cả Gutenberg và Classic.
Version: 1.0
Author: Bạn
*/

defined('ABSPATH') || exit;

// Gutenberg
add_action('enqueue_block_editor_assets', 'ai_gen_enqueue_gutenberg');
function ai_gen_enqueue_gutenberg() {
    wp_enqueue_script(
        'ai-gen-editor-js',
        plugin_dir_url(__FILE__) . 'editor.js',
        ['wp-plugins','wp-edit-post','wp-element','wp-components','wp-data','wp-blocks'],
        filemtime(__FILE__),
        true
    );
    wp_localize_script('ai-gen-editor-js', 'AI_GEN', [
        'proxy_url' => 'https://<YOUR_VERCEL_DOMAIN>/proxy'
    ]);
}

// Classic Editor
add_action('add_meta_boxes', 'ai_gen_add_meta_box');
function ai_gen_add_meta_box() {
    add_meta_box('ai_gen_classic', '🧠 AI Content', 'ai_gen_classic_cb', 'post', 'normal');
}
function ai_gen_classic_cb($post) {
    ?>
    <label>Prompt:</label><br/>
    <input type="text" id="ai_gen_prompt" style="width:100%;" />
    <button type="button" onclick="aiGenClassicGenerate()">🚀 Generate AI Content</button>
    <p id="ai_gen_status"></p>
    <script>
    async function aiGenClassicGenerate() {
        const prompt = document.getElementById('ai_gen_prompt').value;
        document.getElementById('ai_gen_status').textContent = '⏳ Đang tạo...';
        const res = await fetch(AI_GEN.proxy_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (data.summary) {
            if (typeof tinyMCE !== 'undefined' && tinyMCE.activeEditor) {
                tinyMCE.activeEditor.setContent(data.summary.replace(/\n/g,'<br>'));
            } else {
                document.getElementById('content').value = data.summary;
            }
            document.getElementById('ai_gen_status').textContent = '✅ Đã chèn!';
        } else {
            document.getElementById('ai_gen_status').textContent = '❌ ' + (data.error||'No content');
        }
    }
    </script>
    <?php
}
