import { identity } from "../../lib/server";
import Marketplace from "../../components/marketplace";
export const dynamic = "force-dynamic";
export default async function Page({params,searchParams}:{params:Promise<{slug:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {slug}=await params;const search=await searchParams;const query=new URLSearchParams();
  for(const [key,value] of Object.entries(search||{})){for(const item of Array.isArray(value)?value:value===undefined?[]:[value])query.append(key,item);}
  return <Marketplace initialPath={"/"+slug.join("/")+(query.size?`?${query}`:"")} initialUser={await identity()} />;
}
