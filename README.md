# AI Content Generator

- **WordPress plugin**: tự động tạo nội dung AI theo prompt, hỗ trợ Gutenberg & Classic.
- **proxy**: Node.js trên Vercel để gọi Gemini AI.

## Triển khai

1. Upload plugin vào `wp-content/plugins`, Activate.
2. Deploy `proxy/` lên Vercel (project Node.js).
3. Cấu hình biến `GEMINI_API_KEY` trên Vercel.
4. Mở Post editor (Gutenberg hoặc Classic), sử dụng nút AI.
