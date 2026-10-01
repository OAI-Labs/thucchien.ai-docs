---
sidebar_position: 1
---

# Giới thiệu về VibeCoding

[**VibeCoding**](https://vi.wikipedia.org/wiki/Vibe_coding) là một phương pháp lập trình hiện đại, cho phép bạn xây dựng ứng dụng bằng cách mô tả ý tưởng bằng ngôn ngữ tự nhiên. Thay vì viết từng dòng code, bạn "ra lệnh" cho một trợ lý AI, và nó sẽ tạo ra mã nguồn cho bạn.

Thuật ngữ này được nhà nghiên cứu AI nổi tiếng Andrej Karpathy giới thiệu, đánh dấu một sự thay đổi trong cách chúng ta tiếp cận việc phát triển phần mềm.

## Cách thức hoạt động

Quy trình VibeCoding rất đơn giản và trực quan:

1.  **Mô tả ý tưởng:** Bạn bắt đầu bằng cách đưa ra một yêu cầu rõ ràng bằng ngôn ngữ tự nhiên. Ví dụ: *"Tạo một trang web bán cà phê với giao diện dễ thương và nút đặt hàng."*
2.  **AI tạo mã:** Một hệ thống AI mạnh mẽ, như các mô hình có sẵn qua **AI Thực Chiến Gateway**, sẽ phân tích yêu cầu của bạn và chuyển đổi nó thành mã nguồn hoàn chỉnh (HTML, CSS, JavaScript, Python, v.v.).
3.  **Kiểm tra và tinh chỉnh:** Bạn kiểm tra kết quả, chạy thử ứng dụng, và yêu cầu AI điều chỉnh nếu cần. Ví dụ: *"Thêm hiệu ứng hoạt hình cho nút đặt hàng."*

## Ưu điểm

-   **Tiếp cận dễ dàng:** Người không chuyên cũng có thể tạo ứng dụng mà không cần kiến thức lập trình sâu.
-   **Tiết kiệm thời gian:** Giảm đáng kể thời gian từ ý tưởng đến sản phẩm hoạt động.
-   **Khuyến khích sáng tạo:** Giúp bạn thử nghiệm và hiện thực hóa các ý tưởng một cách nhanh chóng.

## Hạn chế

-   **Chất lượng mã nguồn:** Mã do AI tạo ra có thể thiếu tối ưu, dễ gặp lỗi hoặc lỗ hổng bảo mật.
-   **Khó kiểm soát:** Việc không hiểu rõ mã nguồn có thể gây khó khăn trong việc bảo trì và mở rộng.
-   **Phụ thuộc vào AI:** Nếu AI tạo mã không chính xác, việc sửa chữa có thể phức tạp.

## Kết luận

VibeCoding mở ra một kỷ nguyên mới, nơi rào cản kỹ thuật được giảm xuống, cho phép nhiều người hơn tham gia vào quá trình sáng tạo phần mềm. Tuy nhiên, để đảm bảo chất lượng và bảo mật, việc kết hợp sức mạnh của AI với kiến thức lập trình cơ bản là vô cùng quan trọng.

**AI Thực Chiến Gateway** chính là "bộ não" đằng sau quy trình VibeCoding của bạn, cung cấp quyền truy cập vào các mô hình AI hàng đầu để biến ý tưởng của bạn thành hiện thực.

## Công cụ dùng được với Gateway

Các coding agent (còn gọi là *harness*) dưới đây đã được kiểm tra với gateway. Mỗi công cụ gọi gateway theo một chuẩn API khác nhau, nên model dùng được cũng khác nhau.

| Công cụ | Chuẩn API | Model dùng được | Hướng dẫn |
|---|---|---|---|
| Cline | OpenAI Chat Completions (LiteLLM) | Gemini, DeepSeek | [Cline](./cline-integration) |
| Cursor | OpenAI Chat Completions | Gemini, DeepSeek | [Cursor](./cursor-integration) |
| Codex (CLI, desktop, VS Code) | OpenAI Responses | Tất cả model văn bản | [Codex](./codex-integration) |
| DeepSeek Harness | OpenAI Responses | Tất cả model văn bản | [DeepSeek Harness](./deepseek-harness-integration) |
| Hermes Agent | OpenAI Chat Completions | Gemini, DeepSeek | [Hermes Agent](./hermes-agent-integration) |
| Antigravity CLI | Gemini API | Chỉ Gemini | [Antigravity CLI](./antigravity-integration) |
| OpenCode | Chat Completions + Responses | Tất cả model văn bản | [OpenCode](./opencode-integration) |
| Gemini CLI | Gemini API | Chỉ Gemini | [Gemini CLI](./gemini-cli-integration) |

:::warning[Khả năng tương thích]
- Qua chuẩn Chat Completions, model OpenAI đời mới (`gpt-6-*`) **không gọi được tool** khi đang suy nghĩ (lỗi 400). Với công cụ dùng chuẩn này, hãy chọn model Gemini hoặc DeepSeek. Muốn dùng `gpt-6-*` cho agent, hãy dùng Codex hoặc DeepSeek Harness.
- Công cụ chỉ chạy trong hệ sinh thái đóng, không cho dùng API key riêng (BYOK) hay endpoint tuỳ chỉnh, thì không dùng được với gateway.
:::
