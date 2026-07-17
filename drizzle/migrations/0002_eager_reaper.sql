CREATE TABLE "proof_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"reason" text,
	"repository_digest" text,
	"repository_visibility" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proofs" (
	"id" text PRIMARY KEY NOT NULL,
	"schema_version" text NOT NULL,
	"proof_type" text NOT NULL,
	"issuer_type" text NOT NULL,
	"repository" text NOT NULL,
	"issuer_claims" jsonb NOT NULL,
	"observations" jsonb NOT NULL,
	"submitted_context" jsonb,
	"idempotency_key" text,
	"jti_digest" text NOT NULL,
	"request_id" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_proof_events_event" ON "proof_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "idx_proof_events_created_at" ON "proof_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_proofs_jti_digest" ON "proofs" USING btree ("jti_digest");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_proofs_idempotency" ON "proofs" USING btree ("repository","idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_proofs_expires_at" ON "proofs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_proofs_repository" ON "proofs" USING btree ("repository");