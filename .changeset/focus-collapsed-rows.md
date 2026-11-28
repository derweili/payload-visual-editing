---
"@derweili/payload-visual-editing": patch
---

Fix: clicking content in a block or array row that the editor had collapsed during the session expanded the row and scrolled to it, but didn't focus the field. Payload keeps a collapsed row's fields in the DOM, hidden, and a hidden input can't take focus. Focusing now waits until the row shows the field.
