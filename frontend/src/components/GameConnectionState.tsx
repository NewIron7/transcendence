import { Badge } from "./ui/badge";

export default function GameConnectionState({ isConnected }: { isConnected: boolean }) {
    return (
        <div>
            {isConnected
                ? <Badge variant="outline" className="bg-lime-800">ONLINE</Badge>
                : <Badge variant="destructive">OFFLINE</Badge>
            }
        </div>

    );
}