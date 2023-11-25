import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1700953593224 implements MigrationInterface {
    name = 'Migrations1700953593224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_group" ALTER COLUMN "counter" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_group" ALTER COLUMN "counter" SET NOT NULL`);
    }

}
