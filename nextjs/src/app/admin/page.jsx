"use client";

import { saveData } from "@/services/saveJSON";
import { loadData } from "@/services/loadJSON";
import { buildBoxes } from "@/components/buildBoxe"
import { useState, useEffect } from "react";
import NasaMedia from "@/services/infonasa";
import Clock from "@/components/Clock";
import LatestWordPressVersion from "@/services/wordpresslastversion";
import NextFreeze from "@/components/freeze";
import Salleinfo from "@/services/Salleinfo";

export default function BackOffice(){
    const [ boxe, setBoxe] = useState([]);
    const [ boxSerializable, setBoxSerializable] = useState([]);
    const box1 = [
        { id: 1, width: 2, height: 4, content: <iframe src="https://actu.epfl.ch/?dashboardfr" className="w-full h-full"></iframe>},
        { id: 2, width: 2, height: 1, content: <Salleinfo room={"INN011"}></Salleinfo>  },
        { id: 3, width: 1, height: 1, content: <LatestWordPressVersion></LatestWordPressVersion>},
        { id: 4, width: 1, height: 1, content: <Clock></Clock> },
        { id: 5, width: 2, height: 1, content: <Salleinfo room={"INN033"}></Salleinfo>  },
        { id: 6, width: 2, height: 2, content: <NasaMedia></NasaMedia> },
        { id: 7, width: 2, height: 1, content: <Salleinfo room={"INN041"}></Salleinfo>},
        { id: 8, width: 1, height: 1},
        { id: 9, width: 1, height: 1, content: <></>},
        { id: 10, width: 2, height: 1, content: <NextFreeze></NextFreeze>},
    ];
    useEffect(() => {
        setBoxSerializable([
            { id: 1, width: 2, height: 4, type: "iframe", props: { src: "https://actu.epfl.ch/?dashboardfr", className: "w-full h-full" } },
            { id: 2, width: 2, height: 1, type: "Salleinfo", props: { room: "INN011" } },
            { id: 3, width: 1, height: 1, type: "LatestWordPressVersion" },
            { id: 4, width: 1, height: 1, type: "Clock" },
            { id: 5, width: 2, height: 1, type: "Salleinfo", props: { room: "INN033" } },
            { id: 6, width: 2, height: 2, type: "NasaMedia" },
            { id: 7, width: 2, height: 1, type: "Salleinfo", props: { room: "INN041" } },
            { id: 8, width: 1, height: 1, type: "" },
            { id: 9, width: 1, height: 1, type: "" },
            { id: 10, width: 2, height: 1, type: "NextFreeze" },
        ]);
        handleLoad();
    }, [])

    const handleSave = async (array) => {
        if(await saveData(array)) {
            alert("Save !!");
        }
        
    }
    const handleLoad = async () => {
        const res = await loadData();
        console.log(res);
        setBoxe(res);
        setBoxe(buildBoxes(res));
    }
    return(
        <div className="flex justify-center items-center">
        
            <h1>
                <input className="btn" placeholder="Save" type="button" onClick={() => handleSave(boxSerializable)}/>
            </h1>
            <h1>
                <input className="btn" placeholder="Load" type="button" onClick={() => handleLoad()}/>
            </h1>
            {boxe.map((box) => (
                <div
                key={box.id}
                className="border border-gray-600 rounded-3xl flex justify-center items-center text-white font-bold shadow-md p-2"
                style={{
                    gridColumn: `span ${box.width}`,
                    gridRow: `span ${box.height}`,
                }}
                >
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                    {box.content}
                </div>
                </div>
            ))}
        </div>
    );
}