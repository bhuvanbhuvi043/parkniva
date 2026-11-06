import { identity } from "../lib/server";
import Marketplace from "../components/marketplace";
export const dynamic = "force-dynamic";
export default async function Home() { return <Marketplace initialPath="/" initialUser={await identity()} />; }
