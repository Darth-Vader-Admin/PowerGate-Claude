import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Collapse from "@mui/material/Collapse";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import ReturnLink from "components/common/ReturnLink";
import PageHeader from "components/common/PageHeader";
import SectionCard from "components/common/SectionCard";
import FilterChips from "components/common/FilterChips";
import appConfig from "config/app";
import { faqs, faqCategories } from "data/faqs";
import tokens from "theme/tokens";

const socials = [
  { label: "LinkedIn", href: appConfig.social.linkedin, icon: LinkedInIcon },
  { label: "Facebook", href: appConfig.social.facebook, icon: FacebookIcon },
  { label: "Instagram", href: appConfig.social.instagram, icon: InstagramIcon },
  { label: "Website", href: appConfig.social.website, icon: LanguageIcon, handle: "bickertmanagement.com" },
].filter((s) => s.href);

export default function HelpFaq() {
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(0);
  const shown = category === "All" ? faqs : faqs.filter((f) => f.cat === category);

  return (
    <>
      <ReturnLink />
      <PageHeader
        title="Help & FAQ"
        description="Answers to the questions clients ask us most about approvals, your battery and PowerPlans."
      />

      <Box
        component="section"
        sx={{
          bgcolor: "#160709",
          border: "1px solid #4a1418",
          borderRadius: "20px",
          px: { xs: 2.5, md: 4 },
          py: 3.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Box sx={{ width: 60, height: 60, borderRadius: "16px", bgcolor: tokens.color.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MenuBookOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h2">How to use PowerGate</Typography>
            <Typography sx={{ fontSize: 15, color: "#cfcfcf", mt: 0.75 }}>
              Step-by-step guide to the client approval portal, with screenshots.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="large"
          href={appConfig.userGuideUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon />}
        >
          Open the guide
        </Button>
      </Box>

      <SectionCard
        title="Frequently asked questions"
        actions={
          <FilterChips
            options={faqCategories.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={(c) => {
              setCategory(c);
              setOpen(0);
            }}
            ariaLabel="FAQ categories"
          />
        }
      >
        {shown.map((f, index) => {
          const isOpen = open === index;
          return (
            <Box key={f.q} sx={{ borderTop: `1px solid ${tokens.color.border}` }}>
              <ButtonBase
                onClick={() => setOpen(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                sx={{
                  width: "100%",
                  minHeight: 64,
                  py: 2,
                  px: 0.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  textAlign: "left",
                  color: tokens.color.text,
                  fontFamily: tokens.font.body,
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: tokens.color.link }}>
                    {f.cat}
                  </Typography>
                  <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{f.q}</Typography>
                </Box>
                <Box sx={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${tokens.color.borderButton}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                  {isOpen ? "−" : "+"}
                </Box>
              </ButtonBase>
              <Collapse in={isOpen}>
                <Typography sx={{ pr: { xs: 1, md: 7 }, pl: 0.5, pb: 2.5, fontSize: 15, lineHeight: 1.75, color: "#cfcfcf" }}>
                  {f.a}
                </Typography>
              </Collapse>
            </Box>
          );
        })}
      </SectionCard>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) minmax(0,2fr)" }, gap: 2.5 }}>
        <SectionCard title="Still have a question?">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            <Typography sx={{ fontSize: 15, lineHeight: 1.7, color: tokens.color.textDim }}>
              Our Customer Service team will get back to you.
            </Typography>
            <Link href={`mailto:${appConfig.supportEmail}`} sx={{ fontWeight: 700, wordBreak: "break-all", color: tokens.color.link }}>
              {appConfig.supportEmail}
            </Link>
            <Button component={RouterLink} to="/client/requests" variant="outlined" sx={{ alignSelf: "flex-start", mt: 0.75 }}>
              Submit a request
            </Button>
          </Box>
        </SectionCard>

        <SectionCard title="Follow BMI" subtitle="Zoho tips, product walkthroughs and company news.">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {appConfig.social.youtube && (
              <ButtonBase
                component="a"
                href={appConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ p: 2.5, borderRadius: "16px", bgcolor: tokens.color.accent, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", textAlign: "left" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: "#fff", color: tokens.color.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PlayArrowIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>BMI on YouTube</Typography>
                    <Typography sx={{ fontSize: 14, color: "#ffe4e6" }}>Tutorials and Zoho how-tos</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontWeight: 700 }}>Subscribe</Typography>
              </ButtonBase>
            )}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, gap: 1.5 }}>
              {socials.map(({ label, href, icon: Icon, handle }) => (
                <ButtonBase
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ minHeight: 96, p: 2, borderRadius: "14px", border: `1px solid ${tokens.color.borderStrong}`, bgcolor: tokens.color.input, color: tokens.color.text, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 1.25 }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{label}</Typography>
                    {handle && <Typography sx={{ fontSize: 12, color: tokens.color.textMuted }}>{handle}</Typography>}
                  </Box>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </SectionCard>
      </Box>
    </>
  );
}
