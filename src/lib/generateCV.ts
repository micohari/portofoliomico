import jsPDF from "jspdf";
import type { PortfolioData } from "@/hooks/usePortfolioData";

type Ctx = Pick<
  PortfolioData,
  "profile" | "strengths" | "experiences" | "projects" | "certifications" | "models" | "videos"
>;

/**
 * Generates a Harvard-style resume PDF.
 * Serif typography (Times), black & white, centered header,
 * bold uppercase section titles with a full-width rule, and
 * org/position with right-aligned location/date lines.
 */
export function generateCV(ctx: Ctx) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54; // ~0.75in
  const maxW = pageW - margin * 2;
  let y = margin;

  const profile = ctx.profile ?? ({} as any);

  const ensure = (need: number) => {
    if (y + need > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const setFont = (style: "normal" | "bold" | "italic" | "bolditalic", size: number) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
  };

  // ===== Header =====
  doc.setTextColor(0, 0, 0);
  setFont("bold", 22);
  const name = profile.name ?? "Your Name";
  doc.text(name, pageW / 2, y + 16, { align: "center" });
  y += 26;

  const contactBits: string[] = [];
  if (profile.location) contactBits.push(profile.location);
  if (profile.email) contactBits.push(profile.email);
  if (profile.phone) contactBits.push(profile.phone);
  if (profile.linkedin) contactBits.push(profile.linkedin);
  if (profile.github) contactBits.push(profile.github);

  setFont("normal", 10);
  const contactLine = contactBits.join("  •  ");
  const contactLines = doc.splitTextToSize(contactLine, maxW);
  contactLines.forEach((l: string) => {
    doc.text(l, pageW / 2, y, { align: "center" });
    y += 12;
  });
  y += 8;

  // ===== Section title =====
  const sectionTitle = (title: string) => {
    ensure(28);
    setFont("bold", 11);
    doc.text(title, margin, y);
    doc.setLineWidth(0.6);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y + 3, pageW - margin, y + 3);
    y += 16;
  };

  // Two-column entry header: left bold, right normal, same baseline.
  const entryRow = (
    left: string,
    right: string,
    leftStyle: "bold" | "italic" | "normal" = "bold",
    size = 10.5,
  ) => {
    ensure(14);
    setFont(leftStyle, size);
    doc.text(left, margin, y);
    if (right) {
      setFont("normal", size);
      doc.text(right, pageW - margin, y, { align: "right" });
    }
    y += 13;
  };

  const paragraph = (text: string, size = 10) => {
    setFont("normal", size);
    const lines = doc.splitTextToSize(text, maxW);
    lines.forEach((line: string) => {
      ensure(size + 3);
      doc.text(line, margin, y);
      y += size + 2;
    });
  };

  const bullet = (text: string, indent = 14, size = 10) => {
    setFont("normal", size);
    const lines = doc.splitTextToSize(text, maxW - indent);
    lines.forEach((line: string, idx: number) => {
      ensure(size + 3);
      if (idx === 0) doc.text("•", margin + 4, y);
      doc.text(line, margin + indent, y);
      y += size + 2;
    });
  };

  // ===== Summary (optional, not strictly Harvard but useful) =====
  if (profile.summary) {
    sectionTitle("Summary");
    paragraph(profile.summary);
    y += 6;
  }

  // ===== Experience =====
  if (ctx.experiences.length) {
    sectionTitle("Experience");
    ctx.experiences.forEach((e) => {
      const orgRight = e.location ?? "";
      entryRow(e.company ?? "", orgRight, "bold");
      entryRow(e.role ?? "", e.period ?? "", "italic");
      const bullets: string[] = Array.isArray(e.bullets) ? e.bullets : [];
      bullets.forEach((b) => bullet(b));
      const subRoles = Array.isArray(e.sub_roles) ? e.sub_roles : [];
      subRoles.forEach((sr) => {
        ensure(14);
        setFont("bolditalic", 10);
        doc.text(sr.title, margin, y);
        y += 12;
        (sr.bullets ?? []).forEach((b) => bullet(b));
      });
      y += 4;
    });
  }

  // ===== Projects (mapped as Leadership / Projects) =====
  if (ctx.projects.length) {
    sectionTitle("Projects");
    ctx.projects.forEach((p) => {
      entryRow(p.title ?? "", "", "bold");
      if (p.description) paragraph(p.description, 10);
      const tags: string[] = Array.isArray(p.stack) ? p.stack : [];
      if (tags.length) {
        setFont("italic", 9.5);
        const tagLine = `Tools: ${tags.join(", ")}`;
        const lines = doc.splitTextToSize(tagLine, maxW);
        lines.forEach((line: string) => {
          ensure(11);
          doc.text(line, margin, y);
          y += 11;
        });
      }
      y += 4;
    });
  }

  // ===== 3D Architectural Showcase =====
  const models = Array.isArray(ctx.models) ? ctx.models : [];
  if (models.length) {
    sectionTitle("3D Architectural Showcase");
    models.forEach((m) => {
      entryRow(m.title ?? "", (m.format ?? "").toUpperCase(), "bold");
      if (m.description) paragraph(m.description, 10);
      const tags: string[] = Array.isArray(m.tags) ? m.tags : [];
      if (tags.length) {
        setFont("italic", 9.5);
        const tagLine = `Tags: ${tags.join(", ")}`;
        const lines = doc.splitTextToSize(tagLine, maxW);
        lines.forEach((line: string) => {
          ensure(11);
          doc.text(line, margin, y);
          y += 11;
        });
      }
      if (m.file_url) {
        setFont("italic", 9);
        doc.setTextColor(80, 80, 160);
        const lines = doc.splitTextToSize(`Model: ${m.file_url}`, maxW);
        lines.forEach((line: string) => {
          ensure(11);
          doc.text(line, margin, y);
          y += 11;
        });
        doc.setTextColor(0, 0, 0);
      }
      y += 4;
    });
  }

  // ===== Awareness Videos =====
  const videos = Array.isArray(ctx.videos) ? ctx.videos : [];
  if (videos.length) {
    sectionTitle("Awareness Videos");
    videos.forEach((v) => {
      entryRow(v.title ?? "", "", "bold");
      if (v.description) paragraph(v.description, 10);
      if (v.video_url) {
        setFont("italic", 9);
        doc.setTextColor(80, 80, 160);
        const lines = doc.splitTextToSize(`Tonton: ${v.video_url}`, maxW);
        lines.forEach((line: string) => {
          ensure(11);
          doc.text(line, margin, y);
          y += 11;
        });
        doc.setTextColor(0, 0, 0);
      }
      y += 4;
    });
  }

  // ===== Certifications =====
  if (ctx.certifications.length) {
    sectionTitle("Certifications & Awards");
    ctx.certifications.forEach((c) => {
      const right = [c.issuer, c.year].filter(Boolean).join(" — ");
      entryRow(c.title ?? "", right, "bold");
    });
    y += 4;
  }

  // ===== Skills & Interests =====
  if (ctx.strengths.length) {
    sectionTitle("Skills & Interests");
    ctx.strengths.forEach((s) => {
      ensure(14);
      setFont("bold", 10);
      const label = `${s.title}: `;
      doc.text(label, margin, y);
      const labelW = doc.getTextWidth(label);
      setFont("normal", 10);
      const desc = s.description ?? "";
      const lines = doc.splitTextToSize(desc, maxW - labelW);
      lines.forEach((line: string, idx: number) => {
        if (idx === 0) {
          doc.text(line, margin + labelW, y);
        } else {
          ensure(12);
          doc.text(line, margin, y);
        }
        y += 12;
      });
      y += 2;
    });
  }

  // ===== Footer page numbers =====
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    setFont("normal", 8);
    doc.setTextColor(120, 120, 120);
    doc.text(`${i} / ${pages}`, pageW - margin, pageH - 24, { align: "right" });
  }

  const safeName = (profile.name ?? "CV").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
  doc.save(`${safeName}_Resume.pdf`);
}
