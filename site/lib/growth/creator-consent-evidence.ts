import { createHash } from "crypto";
import {
  CREATOR_CONSENT_TEXT,
  CREATOR_CONSENT_VERSION,
  type ConsentLocale,
} from "@/lib/growth/creator-consent";

/** Click-wrap method identifier (eIDAS / ESIGN-friendly audit label). */
export const CREATOR_CONSENT_METHOD = "clickwrap_v1";

export type ConsentAttestations = {
  scrolledToEnd: boolean;
  readAndUnderstood: boolean;
  contentResponsibility: boolean;
  legalCapacity: boolean;
};

export function hashConsentDocument(text: string, version: string): string {
  return createHash("sha256").update(`${version}\n${text}`, "utf8").digest("hex");
}

/** Canonical hashes for published agreement versions — verify ledger integrity. */
export function getCanonicalConsentHashes(version: string = CREATOR_CONSENT_VERSION): Record<ConsentLocale, string> {
  const locales: ConsentLocale[] = ["ar", "en", "fr"];
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      hashConsentDocument(CREATOR_CONSENT_TEXT[locale], version),
    ]),
  ) as Record<ConsentLocale, string>;
}

export type ConsentEvidenceInput = {
  userId: string;
  signerName: string;
  signerEmail: string;
  locale: ConsentLocale;
  qualificationStatement: string;
  attestations: ConsentAttestations;
  ipAddress: string;
  userAgent: string;
  previousRecordId?: string | null;
};

export type ConsentEvidencePayload = {
  consentVersion: string;
  consentLocale: ConsentLocale;
  consentTextSnapshot: string;
  consentTextHash: string;
  signerName: string;
  signerEmail: string;
  qualificationStatement: string;
  attestations: ConsentAttestations;
  consentMethod: string;
  ipAddress: string;
  userAgent: string;
  recordedAt: Date;
  previousRecordId: string | null;
};

export function buildConsentEvidencePayload(input: ConsentEvidenceInput): ConsentEvidencePayload {
  const consentTextSnapshot = CREATOR_CONSENT_TEXT[input.locale];
  const consentTextHash = hashConsentDocument(consentTextSnapshot, CREATOR_CONSENT_VERSION);

  return {
    consentVersion: CREATOR_CONSENT_VERSION,
    consentLocale: input.locale,
    consentTextSnapshot,
    consentTextHash,
    signerName: input.signerName,
    signerEmail: input.signerEmail,
    qualificationStatement: input.qualificationStatement,
    attestations: input.attestations,
    consentMethod: CREATOR_CONSENT_METHOD,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    recordedAt: new Date(),
    previousRecordId: input.previousRecordId ?? null,
  };
}

export function verifyConsentRecordHash(
  snapshot: string,
  version: string,
  storedHash: string,
): boolean {
  return hashConsentDocument(snapshot, version) === storedHash;
}
