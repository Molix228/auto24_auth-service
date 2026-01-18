import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshTokensMigration1768164911865 implements MigrationInterface {
  name = 'RefreshTokensMigration1768164911865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "user_id" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c31d0a2f38e6e99110df62ab0af" UNIQUE ("token"), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c31d0a2f38e6e99110df62ab0a" ON "refresh_token" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6bbe63d2fe75e7f0ba1710351d" ON "refresh_token" ("user_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6bbe63d2fe75e7f0ba1710351d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c31d0a2f38e6e99110df62ab0a"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_token"`);
  }
}
