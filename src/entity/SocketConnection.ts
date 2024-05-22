import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./User";

@Entity()
class SocketConnection {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.socket_connection)
    user: User;

    @Column({type: "varchar", array: true, default: []})
    socket_ids: string[];
}

export default SocketConnection;