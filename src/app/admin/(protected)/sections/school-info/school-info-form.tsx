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
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { SchoolInfoView } from "@/lib/wordpress/sections/school-info";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

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

export function SchoolInfoForm({ initial }: { initial: SchoolInfoView }) {
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
      setBaseline({
        schoolName,
        shortName,
        logo: { mediaId: logo.mediaId, url: logo.previewUrl, alt: logo.alt },
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
    <form action={formAction} className="space-y-6">
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <TextField
            id="school-name"
            name="schoolName"
            label="School name"
            helperText="Shown in the navbar, footer, and article pages."
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            error={fieldErrors.schoolName}
          />
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <TextField
            id="short-name"
            name="shortName"
            label="Short name"
            helperText={
              'Shown in the navbar on small phone screens (e.g. "FGS").'
            }
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            error={fieldErrors.shortName}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <ImageField
          label="School logo"
          helperText="Shown in the navbar and footer."
          recommendedSize="Square, at least 128×128, transparent background"
          value={logo}
          onChange={setLogo}
          error={fieldErrors["logo.mediaId"] || fieldErrors["logo.alt"]}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <TextField
            id="phone"
            name="phone"
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={fieldErrors.phone}
          />
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
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
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <TextField
          id="address"
          name="address"
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={fieldErrors.address}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <TextField
          id="office-hours"
          name="officeHours"
          label="Office hours"
          value={officeHours}
          onChange={(e) => setOfficeHours(e.target.value)}
          error={fieldErrors.officeHours}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <TextareaField
          id="footer-tagline"
          name="footerTagline"
          label="Footer tagline"
          helperText="Shown under the logo in the site footer."
          rows={2}
          value={footerTagline}
          onChange={(e) => setFooterTagline(e.target.value)}
          error={fieldErrors.footerTagline}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <StringListField
          label="Footer programs list"
          helperText={'Shown under "Programs" in the site footer.'}
          values={footerPrograms}
          onChange={setFooterPrograms}
          itemLabel="Program"
          error={fieldErrors.footerPrograms}
        />
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
