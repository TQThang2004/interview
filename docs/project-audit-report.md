# Báo Cáo Audit Dự Án AI Interview RAG

Ngày kiểm tra: 15/06/2026  
Dự án: Website hỗ trợ sinh viên IT luyện phỏng vấn với AI dựa trên kỹ thuật RAG  
Phạm vi: đọc luồng code, kiểm tra tĩnh, chạy compile/lint/build/RAG check, dọn debug/comment an toàn. Chưa kiểm thử manual toàn bộ UI bằng trình duyệt.

## 1. Tổng Quan Dự Án

Dự án hiện đã có đầy đủ các nhóm chức năng chính cho đồ án/demo:

- Ứng viên: đăng ký, đăng nhập, Google login, hồ sơ, phỏng vấn AI, đánh giá câu trả lời, lịch sử phỏng vấn, luyện tập theo topic RAG, đánh giá CV, community, thông báo.
- Admin: dashboard thống kê, quản lý user, lịch sử phỏng vấn, duyệt/từ chối bài community, quản lý đánh giá CV, kiểm tra trạng thái RAG.
- Backend: FastAPI, PostgreSQL, cookie auth HttpOnly, Gemini, Cloudinary, ChromaDB local.
- Frontend: React/Vite, protected routes, dashboard candidate/admin.
- Data pipeline: parse dataset, chunk JSON, embed vào ChromaDB, kiểm tra trạng thái RAG.

Kết luận ngắn: dự án đã đủ khung chức năng để demo/bảo vệ, RAG đã nạp đủ dữ liệu 13 topic, build frontend chạy được. Các điểm còn cần cải thiện chủ yếu nằm ở test tự động, chất lượng code frontend, chuẩn hóa logging/encoding, hoàn thiện reset password/email/PDF export, và xử lý một số warning React hooks.

## 2. Trạng Thái Hiện Tại Sau Các Lần Hoàn Thiện

Các phần đã được cải thiện trong đợt hoàn thiện gần nhất:

- Bổ sung dependency/backend env mẫu và tách dev dependency.
- Cập nhật schema database chính có đủ bảng auth, interview, practice, community, CV evaluation, notification, reset password token, audit log.
- Bổ sung/sửa migration runner không hard-code đường dẫn máy cá nhân.
- Thay script set admin nguy hiểm bằng luồng nhận email cụ thể.
- Bổ sung auth cho các API AI/tốn chi phí/chứa dữ liệu cá nhân.
- Bổ sung kiểm tra ownership khi lưu câu hỏi/trả lời/lịch sử.
- Bổ sung giới hạn upload và kiểm tra MIME cơ bản.
- Bổ sung rate limit cơ bản cho một số endpoint AI.
- Nạp lại metadata/chunk RAG, đồng bộ đủ 13 topic frontend đang dùng.
- Bổ sung script kiểm tra RAG và trang admin RAG status.
- Sửa community: tạo/xóa bài thành công không còn bị frontend hiểu nhầm là lỗi; ảnh bài viết dùng `objectFit: contain` để hiển thị đầy đủ.
- Thu hẹp vùng hiển thị ảnh ở admin community để giao diện gọn hơn.
- Dọn `console.log`, `print()` debug trong luồng production; giữ `print()` ở script database utility.
- Frontend lint đã hết error, build production pass.

## 3. Bảng Chức Năng Tổng Thể

| Nhóm chức năng | Trạng thái | Ghi chú |
| --- | --- | --- |
| Auth register/login/logout/me | Hoạt động | Có cookie auth, profile route được bảo vệ. |
| Google login | Hoạt động nhưng cần kiểm tra cấu hình deploy | Đã dùng env base URL/client ID, cần cấu hình đúng trên production. |
| Forgot/reset password | Hoạt động mức demo | Có endpoint và token, nhưng chưa có email thật; không nên dùng kiểu trả token trực tiếp cho production. |
| Interview AI | Hoạt động | Có start/evaluate/history; cần manual test full flow với Gemini key thật. |
| TTS/STT | Hoạt động có guard | Cần test với file audio thật và kiểm tra giới hạn kích thước. |
| History interview | Hoạt động | Đã có ownership check; dashboard field đã được đồng bộ. |
| Practice/RAG | Hoạt động | Chroma có 1805 vector, đủ 13 topic. |
| CV evaluation | Hoạt động | Có upload/save/history/delete; export hiện là print browser, chưa phải PDF backend. |
| Community user | Hoạt động | Feed/create/delete/like/save/comment/notification có luồng chính. |
| Admin stats/users | Hoạt động | Có role guard; nên bổ sung test 403 cho user thường. |
| Admin community moderation | Hoạt động | Duyệt/từ chối/xóa có thông báo; cần audit log đầy đủ hơn. |
| Admin CV evaluations | Hoạt động | Có danh sách/xóa; cần xác nhận delete Cloudinary trong mọi case. |
| Admin RAG status | Hoạt động | Có tổng vector, topic, missing topic. |
| Data pipeline | Hoạt động | Có parse/embed/check; còn cảnh báo deprecated Google SDK. |
| Test tự động | Thiếu | Môi trường hiện chưa cài `pytest`; chưa có frontend test. |

## 4. Kiểm Tra Chi Tiết Từng Module

### 4.1 Auth

Luồng hiện tại:

- Frontend gọi `authService`/`api` tới `/api/auth/register`, `/api/auth/login`, `/api/auth/google/callback`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/profile`.
- Backend route auth xử lý request, service thao tác user, cookie HttpOnly được set/clear.
- Profile update yêu cầu `get_current_user`.

Điểm tốt:

- Có phân tách controller/service/schema tương đối rõ.
- Cookie auth HttpOnly phù hợp hơn lưu token trong localStorage.
- Có Google login và env config cho frontend/backend.

Thiếu sót/rủi ro:

- Reset password mới phù hợp demo, chưa có email delivery thật và template email.
- Cần test tự động cho register/login/logout/me/reset.
- Cần kiểm tra production cookie `secure=True`, `sameSite`, domain khi deploy.

Ưu tiên:

- P1: hoàn thiện email reset password thật.
- P1: thêm test auth.
- P2: bổ sung UI thông báo lỗi chi tiết hơn cho Google login cấu hình sai.

### 4.2 Candidate Interview

Luồng hiện tại:

- `InterviewPage` tạo phiên phỏng vấn, upload/đọc CV nếu có, nhập JD/level/language.
- Frontend gọi `/api/start-interview` để sinh câu hỏi.
- Mỗi câu hỏi được lưu vào history, câu trả lời được gửi `/api/evaluate`, sau đó update answer/score.
- Khi kết thúc, frontend gọi complete interview và tạo final feedback dạng rule-based.

Điểm tốt:

- Endpoint start/evaluate yêu cầu đăng nhập.
- Không còn log raw CV/JD/câu trả lời ở production logger.
- Có ownership check khi lưu/update câu hỏi thuộc interview của user.
- UI có xử lý abandon nếu chưa trả lời câu nào.

Thiếu sót/rủi ro:

- Final feedback chưa phải AI tổng hợp sâu, chủ yếu tính toán từ điểm.
- `InterviewPage.jsx` vẫn là component lớn, nhiều trách nhiệm: setup, audio, gọi API, lưu history, hiển thị đánh giá.
- Còn 1 warning React hooks về cleanup ref audio.
- Cần manual test end-to-end với Gemini key thật, microphone/audio thật.

Ưu tiên:

- P1: tách `InterviewPage` thành hook/service nhỏ hơn.
- P1: AI final feedback cuối buổi.
- P2: xử lý warning cleanup ref.

### 4.3 Practice/RAG

Luồng hiện tại:

- Frontend lấy topic và bắt đầu quiz qua `/api/practice/start`.
- Backend truy vấn ChromaDB theo topic/level, tạo session và answers.
- User submit từng câu qua `/api/practice/sessions/{session_id}/submit`.
- Có stats/history/detail/delete session.

Điểm tốt:

- RAG đã nạp đủ 13 topic đang dùng ở frontend.
- Có script `data_pipeline/scripts/check_rag_status.py`.
- Admin có trang RAG status.
- Nếu thiếu dữ liệu topic, backend có thể báo lỗi rõ hơn thay vì fallback sai topic.

Kết quả RAG hiện tại:

| Topic | Vector |
| --- | ---: |
| Data Analysis | 78 |
| Docker | 40 |
| Git | 50 |
| Java | 116 |
| JavaScript | 415 |
| Machine Learning | 164 |
| NodeJS | 100 |
| OOP | 50 |
| Python | 269 |
| React | 320 |
| SQL | 99 |
| Spring | 76 |
| System Design | 28 |

Tổng vector: 1805. Không thiếu topic.

Thiếu sót/rủi ro:

- Topic `System Design` chỉ có 28 vector, thấp hơn các topic lớn.
- Vẫn có cảnh báo `google.generativeai` đã deprecated, nên migrate sang `google.genai`.
- Chưa có test tự động gọi retrieval từng topic.

Ưu tiên:

- P0: giữ ChromaDB/chunk đồng bộ khi chuyển máy hoặc deploy.
- P1: migrate SDK Gemini mới.
- P2: mở rộng dataset topic ít vector.

### 4.4 CV Evaluation

Luồng hiện tại:

- User upload PDF CV, backend extract text, gửi AI đánh giá, có thể lưu kết quả.
- Lịch sử CV có list/detail/delete.
- Admin xem/xóa CV evaluations.
- Frontend export hiện dựa trên `window.print()`.

Điểm tốt:

- Endpoint CV yêu cầu auth.
- Có kiểm tra file PDF và giới hạn upload.
- Có Cloudinary cho file/ảnh liên quan.
- Có history riêng cho user.

Thiếu sót/rủi ro:

- Export PDF chưa phải file PDF server-side; phụ thuộc browser print.
- Cần test file sai MIME/quá dung lượng/PDF hợp lệ.
- Cần đảm bảo không log raw CV trong mọi path phụ.

Ưu tiên:

- P1: test upload validation.
- P1: export PDF thật hoặc HTML print template ổn định.
- P2: rubric đánh giá CV chi tiết hơn theo role.

### 4.5 Community User

Luồng hiện tại:

- Feed bài đã duyệt, tạo bài mới, upload ảnh, xem bài của tôi, xóa bài, like/save/comment, notification.
- Bài mới có trạng thái moderation.
- Ảnh bài viết dùng `objectFit: contain`, có `maxHeight` để hiển thị đủ chiều ngang/dọc.

Điểm tốt:

- Các route community yêu cầu đăng nhập.
- Xóa bài user đã trả JSON status 200 nên frontend không còn báo lỗi giả khi backend xóa thành công.
- UI ảnh bài viết không crop mất nội dung.
- Có notification cho moderation.

Thiếu sót/rủi ro:

- Comment/like/save cần thêm test ownership/duplicate.
- Ảnh `contain` có thể tạo khoảng trống với ảnh tỉ lệ quá dọc/quá ngang; đây là trade-off đúng nếu ưu tiên hiển thị đủ ảnh.
- Cần kiểm tra MIME thật ảnh upload, không chỉ tin vào extension/content-type.

Ưu tiên:

- P1: test create/delete/approve/reject/notification.
- P1: kiểm tra magic bytes upload ảnh.
- P2: viewer modal xem ảnh full size.

### 4.6 Admin

Luồng hiện tại:

- Admin routes đều dùng `get_admin_user`.
- Có stats/chart/users/interviews/top candidates/recent activity.
- Có moderation community approve/reject/delete.
- Có CV evaluations list/delete.
- Có RAG status.

Điểm tốt:

- Phân quyền admin rõ ở router.
- UI admin đã có module RAG status, community moderation, CV evaluations.
- Admin community đã thu hẹp ảnh/card để dễ scan hơn.

Thiếu sót/rủi ro:

- Audit log table đã có, nhưng cần kiểm tra mọi hành động admin quan trọng đã ghi log đầy đủ chưa.
- Cần test 403 khi user thường gọi admin route.
- Một số admin pages còn warning hook dependency.

Ưu tiên:

- P1: audit log bắt buộc cho xóa user, duyệt/từ chối/xóa bài, xóa CV evaluation.
- P1: test role guard.
- P2: lọc/tìm kiếm nâng cao ở admin.

## 5. Đánh Giá Backend

Điểm tốt:

- Cấu trúc backend theo router/controller/service/schema/database tương đối rõ.
- Auth dependency `get_current_user` và `get_admin_user` được dùng nhất quán ở các route nhạy cảm.
- Có exception handler, middleware logging, core config.
- Database schema chính đã đầy đủ hơn, có CHECK constraint và index cho các query quan trọng.
- Logging đã thay thế phần lớn `print()` trong runtime app.

Vấn đề còn lại:

- Một số service/controller còn khá dài, đặc biệt các service AI/RAG có nhiều trách nhiệm.
- Còn `print()` trong `backend/app/database/init_db.py` và `alter_db.py`; đây là script utility nên có thể chấp nhận, nhưng nếu muốn sạch tuyệt đối có thể đổi sang logger.
- Còn phụ thuộc `google.generativeai` deprecated.
- Test backend chưa chạy được trong môi trường hiện tại do thiếu `pytest`.
- Cần rà thêm các path lỗi để đảm bảo không trả chi tiết exception nhạy cảm ra client.

## 6. Đánh Giá Frontend

Điểm tốt:

- React/Vite build production pass.
- API base URL đã dùng `VITE_API_BASE_URL` với fallback local.
- Community image đã đổi sang `objectFit: contain`.
- Admin community layout đã gọn hơn.
- Không còn `console.log` debug trong `frontend/src`.

Vấn đề còn lại:

- `frontend/src/services/api.js` vẫn là file lớn, gom nhiều domain API: auth/interview/practice/community/admin/CV.
- Một số component lớn còn nhiều trách nhiệm, đặc biệt `InterviewPage.jsx` và `CommunityPage.jsx`.
- Lint còn 6 warning React hooks dependency/cleanup ref.
- Một số text/comment trong code từng bị mojibake; cần rà dần để tránh làm khó bảo trì.
- Chưa có test frontend.

Ưu tiên cải thiện:

- Tách service API theo domain.
- Tách custom hooks cho interview, community, admin list.
- Xử lý warning hooks bằng `useCallback`/capture ref đúng cách.
- Thêm test tối thiểu cho auth/community/practice flow.

## 7. Đánh Giá Database/Migration

Điểm tốt:

- `backend/database/schema.sql` đã là source of truth tốt hơn trước.
- Có bảng `password_reset_tokens`, `community_*`, `notifications`, `cv_evaluations`, `practice_*`, `audit_logs`.
- Có CHECK cho status và score.
- Có index cho user history, community status, CV evaluation date, practice session, audit log.
- Migration runner đã tránh hard-code path máy cá nhân.

Vấn đề còn lại:

- Migration cũ vẫn tồn tại để tương thích/lịch sử; không nên xóa mạnh nếu chưa có chiến lược versioning.
- Cần kiểm tra migration idempotent trên database sạch và database đã có dữ liệu.
- Cần seed admin/demo data có kiểm soát cho buổi bảo vệ.

Ưu tiên:

- P1: thêm README init database từ schema/migration.
- P1: test migration trên DB sạch.
- P2: thêm seed script demo.

## 8. Đánh Giá RAG/Data Pipeline

Điểm tốt:

- Dataset chunk JSON đã có đủ topic.
- ChromaDB hiện có 1805 vector.
- `check_rag_status.py` xác nhận đủ 13 topic.
- Có admin endpoint `/api/admin/rag/status`.

Vấn đề còn lại:

- Chưa có benchmark chất lượng retrieval; hiện mới kiểm tra count/topic.
- Một vài topic ít dữ liệu, dễ sinh câu hỏi lặp hoặc kém đa dạng.
- SDK Google cũ tạo warning.
- Nếu deploy sang máy mới, cần hướng dẫn copy/rebuild `chroma_db`.

Ưu tiên:

- P0: đảm bảo README hướng dẫn rebuild RAG.
- P1: test query mẫu từng topic có kết quả đúng.
- P2: thêm đánh giá chất lượng retrieval bằng bộ câu hỏi mẫu.

## 9. Đánh Giá Bảo Mật/Phân Quyền

Điểm tốt:

- API AI/chứa dữ liệu cá nhân đã yêu cầu auth.
- Admin routes có role guard.
- History/interview question update đã có ownership check.
- Upload có giới hạn loại file/kích thước cơ bản.
- Cookie auth phù hợp demo.
- Không còn log raw CV/JD/câu trả lời user trong các path chính.

Rủi ro còn lại:

- Reset password chưa dùng email thật, cần tránh lộ token trong production.
- Rate limit cơ bản, chưa đủ cho production chịu tải.
- Cần kiểm tra CORS/cookie secure/sameSite khi deploy HTTPS.
- Cần test user A không truy cập/sửa dữ liệu user B ở tất cả module: interview, practice, CV, community.
- Cần xác thực MIME thật cho upload ảnh/PDF.

## 10. Đánh Giá Code Quality/Comment/Log/File Dư

Đã dọn:

- Xóa `console.log` debug trong frontend.
- Chuyển nhiều `print()` runtime backend sang logger.
- Xóa/comment lại các comment mojibake gây lint error trong `InterviewPage.jsx`.
- Xóa file sinh/dư đã xác định như `backend/error.log`, `check_result.txt`, một số asset Vite/hero không dùng.

Còn cần chú ý:

- `backend/app/database/init_db.py` và `alter_db.py` còn `print()` do là script utility.
- `frontend/dist` và `__pycache__` có thể sinh lại sau build/compile; không nên commit nếu repo không chủ trương commit build output.
- Một số comment/text tiếng Việt bị mojibake trong repo có thể còn sót ở chỗ chưa ảnh hưởng lint.
- `api.js` frontend cần chia nhỏ để dễ đọc/test.

## 11. Những Gì Đã Làm Được

- Hệ thống có đủ luồng ứng viên và admin cho demo.
- RAG đã nạp đủ dữ liệu, không còn thiếu topic chính.
- Community đã có create/delete/moderation/notification cơ bản.
- Ảnh community hiển thị đủ nội dung thay vì crop.
- Admin có trang kiểm tra RAG.
- Backend auth/role guard được áp dụng rộng hơn.
- Schema database đầy đủ và có constraint/index tốt hơn.
- Frontend lint/build đạt trạng thái chạy được.
- Logging an toàn hơn, hạn chế lộ dữ liệu cá nhân.

## 12. Những Gì Còn Thiếu Sót

- Chưa có test tự động đủ rộng; `pytest` chưa được cài trong môi trường hiện tại.
- Chưa test manual full UI bằng browser cho toàn bộ flow.
- Reset password/email mới ở mức demo, chưa production-ready.
- Export PDF chưa phải PDF generation thật.
- AI final feedback cuối buổi chưa dùng AI tổng hợp lộ trình học.
- Audit log admin cần kiểm tra/hoàn thiện đủ hành động.
- Frontend còn component/service lớn.
- Còn warning React hooks.
- Cần migrate `google.generativeai` sang `google.genai`.
- Cần tài liệu deploy/init DB/rebuild RAG rõ ràng hơn.

## 13. Rủi Ro Khi Demo/Bảo Vệ Đồ Án

| Rủi ro | Mức | Cách giảm rủi ro |
| --- | --- | --- |
| Thiếu API key Gemini/Cloudinary/env khi chạy máy mới | Cao | Chuẩn hóa `.env.example`, README setup, test trước buổi demo. |
| ChromaDB không được copy/rebuild | Cao | Chạy `check_rag_status.py` trước demo, chuẩn bị script rebuild. |
| PostgreSQL chưa init đúng schema | Cao | Có lệnh init DB rõ, chuẩn bị database demo. |
| Reset password bị hỏi production flow | Trung bình | Trình bày rõ đang demo token, email thật là cải tiến P1. |
| Microphone/STT lỗi do browser permission | Trung bình | Chuẩn bị fallback nhập text hoặc audio mẫu. |
| Build chunk lớn | Thấp | Không chặn demo, tối ưu lazy loading sau. |
| Hook warning | Thấp | Không chặn build, nhưng nên xử lý trước khi nộp code cuối. |

## 14. Kế Hoạch Cải Thiện Tiếp Theo

### P0 - Bắt buộc trước demo/bảo vệ

- Cài dependency dev và chạy `pytest`.
- Chạy manual smoke test: register/login, interview full flow, practice React/Python/SQL, CV PDF, community create/delete, admin approve/reject.
- Kiểm tra `.env` thật cho Gemini, Cloudinary, Google OAuth.
- Chạy `python data_pipeline/scripts/check_rag_status.py` ngay trước demo.
- Đảm bảo database demo được init từ schema mới.

### P1 - Nên làm để đồ án chắc hơn

- Hoàn thiện email reset password thật.
- Thêm test backend cho auth, protected routes, ownership, admin 403, upload validation.
- Thêm audit log đầy đủ cho hành động admin.
- AI final feedback cuối interview.
- Export PDF ổn định hơn cho interview/CV.
- Migrate Gemini SDK sang `google.genai`.
- Tách `frontend/src/services/api.js` theo domain.
- Xử lý 6 warning React hooks.

### P2 - Cải thiện chất lượng dài hạn

- Thêm frontend tests.
- Tối ưu lazy loading route admin/dashboard để giảm chunk size.
- Mở rộng dataset topic ít vector.
- Thêm viewer ảnh community full screen.
- Thêm seed data demo và tài liệu vận hành.
- Thêm observability: request id, structured logs, metrics đơn giản.

## 15. Phụ Lục Lệnh Kiểm Tra Và Kết Quả

### Backend compile

Lệnh:

```powershell
python -m compileall backend\app backend\tests data_pipeline\scripts
```

Kết quả: Pass.

### RAG status

Lệnh:

```powershell
python data_pipeline\scripts\check_rag_status.py
```

Kết quả: Pass.

```text
Collection: interview_questions
Chroma path: C:\DOAN\Data\chroma_db
Total vectors: 1805
All expected topics are available.
```

Cảnh báo còn lại:

```text
google.generativeai package has ended support; switch to google.genai.
```

### Frontend lint

Lệnh:

```powershell
npm.cmd run lint
```

Kết quả: Pass với warning.

```text
0 errors, 6 warnings
```

Warning còn lại:

- `InterviewPage.jsx`: cleanup ref audio.
- `AdminCVEvaluations.jsx`: thiếu dependency `loadEvaluations`.
- `AdminCommunityPosts.jsx`: thiếu dependency `loadPosts`.
- `AdminStats.jsx`: thiếu dependency `loadStats`, `loadCandidates`.
- `CommunityPage.jsx`: thiếu dependency `loadFeed`.

### Frontend build

Lệnh:

```powershell
npm.cmd run build
```

Kết quả: Pass.

Cảnh báo còn lại:

- Chunk JS sau minify khoảng 540 KB, lớn hơn ngưỡng 500 KB.
- Có warning plugin timing của Vite/Rolldown.

### Backend tests

Lệnh:

```powershell
python -m pytest backend\tests -q
```

Kết quả: Chưa chạy được do môi trường thiếu package.

```text
No module named pytest
```

Hướng xử lý:

```powershell
pip install -r backend\requirements-dev.txt
python -m pytest backend\tests -q
```

### Kiểm tra debug log

Lệnh:

```powershell
rg "console\.log|print\(" backend\app frontend\src -n
```

Kết quả sau dọn:

- Không còn `console.log` debug trong `frontend/src`.
- `print()` chỉ còn ở script database utility `init_db.py`, `alter_db.py`.
- `window.print()` trong export/print UI là chức năng, không phải debug log.

