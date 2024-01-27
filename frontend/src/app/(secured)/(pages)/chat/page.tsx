'use client'

import ChatArea from "@/components/ChatArea"
import CreateRoom from "@/components/CreateRoom"
import InvitePrivateRoom from "@/components/InvitePrivateRoom";
import JoinRoom from "@/components/JoinRoom";
import RoomList from "@/components/RoomList"
import SettingsRoom from "@/components/SettingsRoom";
import { useState } from "react";

interface IRoomInfoName {
    name: string,
    type: string,
}

interface IRooms {
    private: Array<IRoomInfoName>,
    public: Array<IRoomInfoName>,
    protected: Array<IRoomInfoName>,
}

export default function Chat() {
    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState<IRooms>({
        private: [],
        public: [],
        protected: [],
    });

    return (
        <main className="flex flex-col items-center flex-wrap">
            <h1 className="font-bold text-xl mb-3 mt-3">CHAT</h1>
            <div className="flex items-center flex-wrap">
                <RoomList setRoom={setRoom} room={room} setRooms={setRooms} rooms={rooms} />
                {room && <InvitePrivateRoom room={room} rooms={rooms} />}
                <JoinRoom setRoom={setRoom} setRooms={setRooms} rooms={rooms} />
                <CreateRoom setRoom={setRoom} setRooms={setRooms} rooms={rooms} />
            </div>
            {room && <SettingsRoom roomName={room} />}
            {room && <ChatArea room={room} setRoom={setRoom} />}
        </main>
    )
}
