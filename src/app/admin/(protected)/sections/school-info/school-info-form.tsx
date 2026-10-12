"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  HiddenFileField,
  ImageField,
  StringListField,
  TextField,
  TextareaField,
  type ImageFieldValue,
} from "@/components/admin/fields";
import { applySavedImage } from "@/components/admin/saved-uploads";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { SchoolInfoView } from "@/lib/content/sections/school-info";
import type { SectionSaveResult } from "@/lib/content/sections/types";

import { saveSchoolInfoAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

function toImageFieldValue(view: SchoolInfoView): ImageFieldValue {
  return {
    mediaId: view.logo.mediaId,
    previewUrl: view.logo.url,
    alt: view.logo.alt,
    pendingFile: null,
  };
}

export function SchoolInfoForm({
  initial,
  revision: initialRevision,
}: {
  initial: SchoolInfoView;
  revision: number;
}) {
  const [revision, setRevision] = useState(initialRevision);
  const [baseline, setBaseline] = useState(initial);
  const [schoolName, setSchoolName] = useState(initial.schoolName);
  const [shortName, setShortName] = useState(initial.shortName);
  const [logo, setLogo] = useState<ImageFieldValue>(toImageFieldValue(initial));
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [officeHours, setOfficeHours] = useState(initial.officeHours);
  const [footerTagline, setFooterTagline] = useState(initial.footerTagline);
  const [footerPrograms, setFooterPrograms] = useState(initial.footerPrograms);

  const [state, formAction, isPending] = useActionState(
    saveSchoolInfoAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "School Info saved.",
      );
    } else if (state.status === "error") {
      toast.error(state.message);
    } else if (state.status === "uncertain") {
      toast.warning(state.message);
    } else if (state.status === "validation_error") {
      toast.error("Please fix the highlighted fields.");
    }
  }, [state]);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.status === "success") {
      // Hold the stored media reference instead of the original file.
      const saved = applySavedImage(logo, state.uploadedMedia);
      setRevision(state.revision);
      setLogo(saved);
      setBaseline({
        schoolName,
        shortName,
        logo: { mediaId: saved.mediaId, url: saved.previewUrl, alt: saved.alt },
        address,
        phone,
        email,
        officeHours,
        footerTagline,
        footerPrograms,
      });
    }
  }

  const isDirty =
    schoolName !== baseline.schoolName ||
    shortName !== baseline.shortName ||
    logo.pendingFile !== null ||
    logo.mediaId !== baseline.logo.mediaId ||
    logo.alt !== baseline.logo.alt ||
    address !== baseline.address ||
    phone !== baseline.phone ||
    email !== baseline.email ||
    officeHours !== baseline.officeHours ||
    footerTagline !== baseline.footerTagline ||
    JSON.stringify(footerPrograms) !== JSON.stringify(baseline.footerPrograms);

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setSchoolName(baseline.schoolName);
    setShortName(baseline.shortName);
    setLogo(toImageFieldValue(baseline));
    setAddress(baseline.address);
    setPhone(baseline.phone);
    setEmail(baseline.email);
    setOfficeHours(baseline.officeHours);
    setFooterTagline(baseline.footerTagline);
    setFooterPrograms(baseline.footerPrograms);
  };

  return (
    <form action={formAction} className="flex flex-1 flex-col justify-between">
      <input type="hidden" name="revision" value={revision} />
      <input type="hidden" name="logoMediaId" value={logo.mediaId} />
      <input type="hidden" name="logoAlt" value={logo.alt} />
      {logo.pendingFile && (
        <HiddenFileField name="logoFile" file={logo.pendingFile} />
      )}
      {footerPrograms.map((program, index) => (
        <input
          key={index}
          type="hidden"
          name="footerPrograms"
          value={program}
        />
      ))}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 xl:gap-8">
        {/* Column 1: School Identity & Contact Details */}
        <div className="space-y-6">
          {/* School Identity */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-800">School Identity</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="school-name"
                  name="schoolName"
                  label="School Name"
                  helperText="Shown in navbar, footer, and articles."
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  error={fieldErrors.schoolName}
                />
                <TextField
                  id="short-name"
                  name="shortName"
                  label="Short Name"
                  helperText='Small screens (e.g. "FGS").'
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  error={fieldErrors.shortName}
                />
              </div>
              <ImageField
                label="School Logo"
                helperText="Shown in the navbar and footer."
                recommendedSize="Square, at least 128×128, transparent background"
                value={logo}
                onChange={setLogo}
                error={fieldErrors["logo.mediaId"] || fieldErrors["logo.alt"]}
              />
            </div>
          </div>

          {/* Contact & Location */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-800">Contact & Location</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="phone"
                  name="phone"
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={fieldErrors.phone}
                />
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                />
              </div>
              <TextField
                id="address"
                name="address"
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={fieldErrors.address}
              />
              <TextField
                id="office-hours"
                name="officeHours"
                label="Office Hours"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                error={fieldErrors.officeHours}
              />
            </div>
          </div>
        </div>

        {/* Column 2: Footer Settings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-800">Footer Tagline</h2>
            <div className="mt-4">
              <TextareaField
                id="footer-tagline"
                name="footerTagline"
                label="Tagline"
                helperText="Shown under the logo in the site footer."
                rows={3}
                value={footerTagline}
                onChange={(e) => setFooterTagline(e.target.value)}
                error={fieldErrors.footerTagline}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-800">Footer Programs</h2>
            <div className="mt-4">
              <StringListField
                label="Programs List"
                helperText={'Shown under "Programs" in the site footer.'}
                values={footerPrograms}
                onChange={setFooterPrograms}
                itemLabel="Program"
                error={fieldErrors.footerPrograms}
              />
            </div>
          </div>
        </div>
      </div>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/"
      />
    </form>
  );
}
