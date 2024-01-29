import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1701175969153 implements MigrationInterface {
    name = 'Migrations1701175969153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_group" ADD "isFinished" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_group" DROP COLUMN "isFinished"`);
    }

}
