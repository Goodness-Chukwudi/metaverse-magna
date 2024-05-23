import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ITEM_STATUS } from "../data/enums/enum";
import SocketConnection from "./SocketConnection";
import UserPassword from "./UserPassword";

@Entity()
class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    first_name: string;

    @Column("varchar")
    last_name: string;

    @Column({type: "varchar", nullable: true})
    middle_name?: string;

    @Column({type: "varchar", unique: true})
    email: string;

    @OneToOne(() => SocketConnection, (socketConnection) => socketConnection.user, {cascade: true})
    @JoinColumn()
    socket_connection: SocketConnection;

    @OneToOne(() => UserPassword, (userPassword) => userPassword.user, {cascade: true})
    @JoinColumn()
    password: UserPassword;

    @Column({type: "enum", enum: Object.values(ITEM_STATUS), default: ITEM_STATUS.ACTIVE})
    status: string
}

export default User;