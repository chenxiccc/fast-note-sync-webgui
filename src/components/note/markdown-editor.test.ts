import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadTransform() {
    vi.resetModules();
    const mod = await import("./markdown-editor");
    return mod.transformObsidianSyntax;
}

describe("transformObsidianSyntax", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("API_URL", "https://notes.example.com");
    });

    it("rewrites markdown image links with resolved file URLs", async () => {
        const transformObsidianSyntax = await loadTransform();

        const transformed = transformObsidianSyntax(
            `![inline](../images/demo.jpg "title")`,
            "Work",
            { "../images/demo.jpg": "notes/images/demo.jpg" },
            "token-123"
        );

        expect(transformed).toContain("https://notes.example.com/api/file?");
        expect(transformed).toContain("vault=Work");
        expect(transformed).toContain("path=notes%2Fimages%2Fdemo.jpg");
        expect(transformed).toContain("token=token-123");
        expect(transformed).toContain(`"title"`);
    });

    it("rewrites html image sources with resolved file URLs", async () => {
        const transformObsidianSyntax = await loadTransform();

        const transformed = transformObsidianSyntax(
            `<img src="./img/html.png" alt="demo">`,
            "Work",
            { "./img/html.png": "assets/html.png" },
            "token-456"
        );

        expect(transformed).toContain(`<img src="https://notes.example.com/api/file?`);
        expect(transformed).toContain("vault=Work");
        expect(transformed).toContain("path=assets%2Fhtml.png");
        expect(transformed).toContain("token=token-456");
        expect(transformed).toContain(`alt="demo"`);
    });

    it("does not rewrite remote image links", async () => {
        const transformObsidianSyntax = await loadTransform();

        const content = `![remote](https://cdn.example.com/demo.png)`;
        const transformed = transformObsidianSyntax(content, "Work", {}, "token-789");

        expect(transformed).toBe(content);
    });
});
