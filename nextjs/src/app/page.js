"use client";

import { loadData } from "@/services/loadJSON";
import { buildBoxes } from "@/components/buildBoxe"
import { useState, useEffect } from "react";
import NasaMedia from "@/services/infonasa";
import Clock from "@/components/Clock";
import LatestWordPressVersion from "@/services/wordpresslastversion";
import NextFreeze from "@/components/freeze";
import Salleinfo from "@/services/Salleinfo";

export default function Home() {

  const [ boxSerializable, setBoxSerializable ] = useState([]);
  const [ boxe, setBoxe ] = useState([]);
  const [ allBoxSets, setAllBoxSets ] = useState([0, 2]);
  const [ activeBoxSet, setActiveBoxSet ] = useState(0);
  const [ refreshItem, setRefreshItem ] = useState(0);
  const [ selectedContainer, setSelectedContainer ] = useState([]);

  useEffect(() => {
    handleLoad();
  }, []);
  const handleLoad = async () => {
      const res = await loadData();
      setBoxSerializable(res);
      setBoxe(buildBoxes(res));
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveBoxSet((prev) => (prev + 1) % allBoxSets.length);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setRefreshItem(prev => prev + 1);
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);
  useEffect(() => {
    const evt = new EventSource("/api/events");
    evt.onmessage = (event) => {
      if (event.data === "update") {
        handleLoad();
      }
    };
    return () => evt.close();
}, []);

  const box1 = [
    { id: 1, width: 2, height: 4, content: <iframe key={refreshItem} src="https://actu.epfl.ch/?dashboardfr" className="w-full h-full"></iframe>},
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

  const box2 = [
    { id: 1, width: 5, height: 1, content: <video autoplay muted loop id="myVideo"></video>  },
    { id: 2, width: 1, height: 1, content: <Clock></Clock>},
    { id: 3, width: 6, height: 3, content: <h1>WPN</h1>},
  ];
    const box3 = [
    { id: 1, width: 6, height: 4, content: <iframe src="https://sdesk-monitoring.epfl.ch/" className="w-full h-full"></iframe>  }
  ];
  useEffect(() => {
    if (boxe.length > 0) {
      const theBoxe = boxSerializable[allBoxSets[activeBoxSet]];
      // setSelectedContainer(theBoxe);
      console.table(theBoxe)
      setSelectedContainer(buildBoxes(theBoxe));
    }
  }, [boxe, activeBoxSet]);


  return (
      <div className="h-screen w-full">
        <div className="grid grid-cols-6 grid-rows-4 gap-2 w-full h-full p-2">
          {Array.isArray(selectedContainer) && selectedContainer.map((box) => (
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
      </div>
  );
}