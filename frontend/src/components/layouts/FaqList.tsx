"use client";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MarkdownContent from "@/components/markdown/MarkdownContent";

interface FaqItem { question: string; answer: string; }
interface FaqSection { category: string; items: FaqItem[]; }

export default function FaqList({ faqs }: { faqs: FaqSection[] }) {
  return (
    <>
      {faqs.map((section, index) => (
        <div key={index}>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            {section.category}
          </Typography>
          {section.items.map((faq, i) => (
            <Accordion key={i}>
              <AccordionSummary expandIcon={<ExpandMoreIcon /> }>
                <Typography variant="h6" fontWeight={600}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <MarkdownContent content={faq.answer} />
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      ))}
    </>
  );
}