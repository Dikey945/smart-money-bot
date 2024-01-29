import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1701216365049 implements MigrationInterface {
    name = 'Migrations1701216365049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "address" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_0a1ed89729fa10ba8b81b99f305" UNIQUE ("address"), CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0a1ed89729fa10ba8b81b99f30" ON "address" ("address") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0a1ed89729fa10ba8b81b99f30"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }

}
