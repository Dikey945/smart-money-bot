import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1700949899355 implements MigrationInterface {
    name = 'Migrations1700949899355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userTgId" integer NOT NULL, "firstName" character varying NOT NULL, "userTag" character varying NOT NULL, "chatId" integer NOT NULL, "isPremium" boolean NOT NULL, CONSTRAINT "UQ_7dc96639910a15980a484abdc55" UNIQUE ("userTgId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7dc96639910a15980a484abdc5" ON "user" ("userTgId") `);
        await queryRunner.query(`CREATE TABLE "client_group" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "channelId" integer NOT NULL, "channelName" character varying NOT NULL, "link" character varying NOT NULL, "counter" character varying NOT NULL, "maxFollowerValue" integer NOT NULL, "ownerId" integer NOT NULL, CONSTRAINT "UQ_32ace0f6c5bcbf3681f5058cafd" UNIQUE ("channelId"), CONSTRAINT "PK_47103afe7488146caef23d1df52" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32ace0f6c5bcbf3681f5058caf" ON "client_group" ("channelId") `);
        await queryRunner.query(`CREATE TABLE "user_client_groups_client_group" ("userId" integer NOT NULL, "clientGroupId" integer NOT NULL, CONSTRAINT "PK_cba6f003c64a906cf50943db831" PRIMARY KEY ("userId", "clientGroupId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_31470524845dddb66badb740f5" ON "user_client_groups_client_group" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_53b019c475d3af766c09a5619d" ON "user_client_groups_client_group" ("clientGroupId") `);
        await queryRunner.query(`ALTER TABLE "user_client_groups_client_group" ADD CONSTRAINT "FK_31470524845dddb66badb740f52" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_client_groups_client_group" ADD CONSTRAINT "FK_53b019c475d3af766c09a5619d2" FOREIGN KEY ("clientGroupId") REFERENCES "client_group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_client_groups_client_group" DROP CONSTRAINT "FK_53b019c475d3af766c09a5619d2"`);
        await queryRunner.query(`ALTER TABLE "user_client_groups_client_group" DROP CONSTRAINT "FK_31470524845dddb66badb740f52"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_53b019c475d3af766c09a5619d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31470524845dddb66badb740f5"`);
        await queryRunner.query(`DROP TABLE "user_client_groups_client_group"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32ace0f6c5bcbf3681f5058caf"`);
        await queryRunner.query(`DROP TABLE "client_group"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7dc96639910a15980a484abdc5"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
