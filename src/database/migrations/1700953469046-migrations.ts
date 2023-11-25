import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1700953469046 implements MigrationInterface {
    name = 'Migrations1700953469046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_32ace0f6c5bcbf3681f5058caf"`);
        await queryRunner.query(`ALTER TABLE "client_group" DROP CONSTRAINT "UQ_32ace0f6c5bcbf3681f5058cafd"`);
        await queryRunner.query(`ALTER TABLE "client_group" DROP COLUMN "channelId"`);
        await queryRunner.query(`ALTER TABLE "client_group" ADD "channelId" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client_group" ADD CONSTRAINT "UQ_32ace0f6c5bcbf3681f5058cafd" UNIQUE ("channelId")`);
        await queryRunner.query(`CREATE INDEX "IDX_32ace0f6c5bcbf3681f5058caf" ON "client_group" ("channelId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_32ace0f6c5bcbf3681f5058caf"`);
        await queryRunner.query(`ALTER TABLE "client_group" DROP CONSTRAINT "UQ_32ace0f6c5bcbf3681f5058cafd"`);
        await queryRunner.query(`ALTER TABLE "client_group" DROP COLUMN "channelId"`);
        await queryRunner.query(`ALTER TABLE "client_group" ADD "channelId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client_group" ADD CONSTRAINT "UQ_32ace0f6c5bcbf3681f5058cafd" UNIQUE ("channelId")`);
        await queryRunner.query(`CREATE INDEX "IDX_32ace0f6c5bcbf3681f5058caf" ON "client_group" ("channelId") `);
    }

}
