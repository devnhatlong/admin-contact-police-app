import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, Drawing, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, HorizontalPositionAlign, VerticalPositionAlign } from 'docx';
import { saveAs } from 'file-saver';
import moment from 'moment';

/**
 * Export Daily Report to Word Document (.docx)
 * @param {Object} reportData - Daily report data containing all form fields
 * @returns {void} - Downloads .docx file automatically
 */

export const exportDailyReportToWord = (reportData) => {
  // Tạo document Word
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header Table với 2 cột
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 44, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CÔNG AN TỈNH LÂM ĐỒNG",
                            bold: true,
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: (reportData.departmentName || "PHÒNG THAM MƯU").toUpperCase(),
                            bold: true,
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Số: ${reportData.reportNumber < 10 ? String(reportData.reportNumber || 0).padStart(2, '0') : reportData.reportNumber}/BC-CAX`,
                            size: 28,
                            font: "Times New Roman",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 120, after: 60 },
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 56, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                            bold: true,
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Độc lập - Tự do - Hạnh phúc",
                            bold: true,
                            size: 26,
                            font: "Times New Roman",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Lâm Đồng, ngày ${reportData.serverDate ? moment(reportData.serverDate).format('DD') : (reportData.reportDate?.format('DD') || moment().format('DD'))} tháng ${reportData.serverDate ? moment(reportData.serverDate).format('MM') : (reportData.reportDate?.format('MM') || moment().format('MM'))} năm ${reportData.serverDate ? moment(reportData.serverDate).format('YYYY') : (reportData.reportDate?.format('YYYY') || moment().format('YYYY'))}`,
                            italics: true,
                            size: 26,
                            font: "Times New Roman",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 120, after: 60 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Tiêu đề
          new Paragraph({
            children: [
              new TextRun({
                text: "BÁO CÁO",
                bold: true,
                size: 28,
                font: "Times New Roman",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Ngày ${reportData.serverDate ? moment(reportData.serverDate).format('DD/MM/YYYY') : (reportData.reportDate?.format('DD/MM/YYYY') || moment().format('DD/MM/YYYY'))}`,
                bold: true,
                size: 28,
                font: "Times New Roman",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
          }),

          // Phần I
          new Paragraph({
            children: [
              new TextRun({
                text: "I. TÌNH HÌNH",
                bold: true,
                size: 28,
                font: "Times New Roman",
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 120 }
          }),

          // 1. An ninh chính trị
          new Paragraph({
            children: [
              new TextRun({
                text: "1. An ninh chính trị",
                bold: true,
                size: 28,
                font: "Times New Roman",
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 120 }
          }),

          ...(reportData.securitySituation ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.securitySituation),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),

          // 2. Trật tự an toàn xã hội
          new Paragraph({
            children: [
              new TextRun({
                text: "2. Trật tự an toàn xã hội",
                bold: true,
                size: 28,
                font: "Times New Roman",
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 120 }
          }),

          ...(reportData.socialOrderSituation ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.socialOrderSituation),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),

          ...(reportData.economicCorruptionEnvironment ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.economicCorruptionEnvironment),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),

          ...(reportData.drugSituation ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.drugSituation),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),

          ...(reportData.trafficAccidentSituation ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.trafficAccidentSituation),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),

          ...(reportData.fireExplosionSituation ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.fireExplosionSituation),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),

          // 3. Tình hình khác
          new Paragraph({
            children: [
              new TextRun({
                text: "3. Tình hình khác",
                bold: true,
                size: 28,
                font: "Times New Roman",
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 120 }
          }),

          ...(reportData.otherSituation ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.otherSituation),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),

          // Phần II
          new Paragraph({
            children: [
              new TextRun({
                text: "II. KIẾN NGHỊ, ĐỀ XUẤT",
                bold: true,
                size: 28,
                font: "Times New Roman",
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 120 }
          }),

          ...(reportData.recommendations ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: stripHtml(reportData.recommendations),
                  size: 28,
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120 }
            })
          ] : []),
        ],
      },
    ],
  });

  // Xuất file
  Packer.toBlob(doc).then((blob) => {
    const fileName = `Bao_cao_ngay_${reportData.serverDate ? moment(reportData.serverDate).format('DD_MM_YYYY') : (reportData.reportDate?.format('DD_MM_YYYY') || moment().format('DD_MM_YYYY'))}.docx`;
    saveAs(blob, fileName);
  });
};

// Helper function để loại bỏ HTML tags
const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};