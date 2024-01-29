import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1701041265021 implements MigrationInterface {
    name = 'Migrations1701041265021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_group" DROP COLUMN "counter"`);
        await queryRunner.query(`ALTER TABLE "client_group" ADD "counter" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_group" DROP COLUMN "counter"`);
        await queryRunner.query(`ALTER TABLE "client_group" ADD "counter" character varying`);
    }

}
