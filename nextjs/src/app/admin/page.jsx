"use client";

import { saveData } from "@/services/saveJSON";
import { loadData } from "@/services/loadJSON";
import { buildBoxes } from "@/components/buildBoxe"
import { useState, useEffect } from "react";
import { registry } from "@/components/registry";
import NasaMedia from "@/services/infonasa";
import Clock from "@/components/Clock";
import LatestWordPressVersion from "@/services/wordpresslastversion";
import NextFreeze from "@/components/freeze";
import Salleinfo from "@/services/Salleinfo";
import Modal from "@/components/modal";

export default function BackOffice() {
    const [boxe, setBoxe] = useState([]);
    const [boxSerializable, setBoxSerializable] = useState([]);
    const [activeBox, setActiveBox] = useState(1);
    const [selectedBox, setSelectedBox] = useState([]);
    const [allContainersSets, setAllContainersSets] = useState([]);
    const [currentContainer, setCurrentContainer] = useState([]);
    const [currentContainerWithEverything, setCurrentContainerWithEverything] =  useState([]);
    const [selectedContainer, setSelectedContainer] = useState(0);
    const [newPropKey, setNewPropKey] = useState("");
    const [showPropModal, setShowPropModal] = useState(false);
    const [showNotEnoughSpaceForNewBoxModal, setShowNotEnoughSpaceForNewBoxModal] = useState(false);
    const [newPropValue, setNewPropValue] = useState("");
    const [gridColumn, setGridColumn] = useState(6);
    const [gridRow, setGridRow] = useState(4);
    // const allBoxSets = [boxe];
    // const currentBoxes = allBoxSets[activeBoxSet];
    const box1 = [
        { id: 1, width: 2, height: 4, content: <iframe src="https://actu.epfl.ch/?dashboardfr" className="w-full h-full"></iframe> },
        { id: 2, width: 2, height: 1, content: <Salleinfo room={"INN011"}></Salleinfo> },
        { id: 3, width: 1, height: 1, content: <LatestWordPressVersion></LatestWordPressVersion> },
        { id: 4, width: 1, height: 1, content: <Clock></Clock> },
        { id: 5, width: 2, height: 1, content: <Salleinfo room={"INN033"}></Salleinfo> },
        { id: 6, width: 2, height: 2, content: <NasaMedia></NasaMedia> },
        { id: 7, width: 2, height: 1, content: <Salleinfo room={"INN041"}></Salleinfo> },
        { id: 8, width: 1, height: 1 },
        { id: 9, width: 1, height: 1, content: <></> },
        { id: 10, width: 2, height: 1, content: <NextFreeze></NextFreeze> },
    ];
    const box2 = [
        { id: 1, width: 5, height: 1, content: <video autoplay muted loop id="myVideo"></video> },
        { id: 2, width: 1, height: 1, content: <Clock></Clock> },
        { id: 3, width: 6, height: 3, content: <h1>WPN</h1> },
    ];
    const box3 = [
        { id: 1, width: 6, height: 4, content: <iframe src="https://sdesk-monitoring.epfl.ch/" className="w-full h-full"></iframe> }
    ];
    useEffect(() => {
        // setBoxSerializable([[
        //     { id: 1, width: 2, height: 4, type: "iframe", props: { src: "https://actu.epfl.ch/?dashboardfr", className: "w-full h-full" } },
        //     { id: 2, width: 2, height: 1, type: "Salleinfo", props: { room: "INN011" } },
        //     { id: 3, width: 1, height: 1, type: "LatestWordPressVersion" },
        //     { id: 4, width: 1, height: 1, type: "Clock" },
        //     { id: 5, width: 2, height: 1, type: "Salleinfo", props: { room: "INN033" } },
        //     { id: 6, width: 2, height: 2, type: "NasaMedia" },
        //     { id: 7, width: 2, height: 1, type: "Salleinfo", props: { room: "INN041" } },
        //     { id: 8, width: 1, height: 1, type: "" },
        //     { id: 9, width: 1, height: 1, type: "" },
        //     { id: 10, width: 2, height: 1, type: "NextFreeze" },
        // ], [
        //     { id: 1, width: 5, height: 1, type: "video", props: { autoplay: true, muted: true, loop: true, id: "myVideo" } },
        //     { id: 2, width: 1, height: 1, type: "Clock" },
        //     { id: 3, width: 6, height: 3, type: "h1", props: { children: "WPN" } },
        // ], [
        //     { id: 1, width: 6, height: 4, type: "iframe", props: { src: "https://sdesk-monitoring.epfl.ch/", className: "w-full h-full" } }
        // ]
        // ]);
        handleLoad();
    }, [])
    useEffect(() => {
        if (
            boxSerializable.length > selectedContainer
        ) {
            setCurrentContainerWithEverything(boxSerializable[selectedContainer]);
            setCurrentContainer(boxSerializable[selectedContainer].boxes)
            console.table(boxSerializable[selectedContainer]);
        }
    }, [boxSerializable, selectedContainer]);

    useEffect(() => {
        setSelectedBox(currentContainer.find(box => box.id === activeBox));
    }, [activeBox])

    useEffect(() => {
        if (currentContainer.length > 0 && !currentContainer.some(box => box.id === activeBox)) {
            setActiveBox(currentContainer[0].id);
        }
        setBoxe(buildBoxes(currentContainer));
    }, [currentContainer]);

    useEffect(() => {
        if (boxSerializable.length > 0 && !boxSerializable.some((box, index) => index === selectedContainer)) {
            const lastIndex = currentContainer.length > 0
                ? Math.min(...boxSerializable.map((box, index) => index))
                : 0;
            setSelectedContainer(lastIndex);
        }
        setBoxe(buildBoxes(currentContainer));
    }, [boxSerializable]);

    useEffect(() => {
        if (currentContainer.length > 0 && activeBox) {
            const found = currentContainer.find(box => box.id === activeBox);
            setSelectedBox(found || null);
        }
    }, [currentContainer, activeBox]);

    const handleSave = async (array) => {
        if (await saveData(array)) {
            alert("Save !!");
        }
    }
    const handleLoad = async () => {
        const res = await loadData();
        setBoxSerializable(res);
        setBoxe(buildBoxes(res));
    }
    const handleNewBox = () => {
        const lastId = currentContainer.length > 0
            ? Math.max(...currentContainer.map(box => box.id))
            : 0;
        const position = findNextAvailablePosition(currentContainer, 1, 1, gridColumn, gridRow);
        if (!position) {
            setShowNotEnoughSpaceForNewBoxModal(true);
        } else {
            const newBox = { id: lastId + 1, width: 1, height: 1, x: position.x, y: position.y, type: "" };
            const updatedContainer = [...currentContainer, newBox];
            handleUpdateContainer(updatedContainer);
            // setCurrentContainer(updatedContainer);
            setBoxe(buildBoxes(updatedContainer));
            console.log("New Box");
        }
    };
    const handleDeleteBox = () => {
        const updatedContainer = currentContainer.filter((box) => box.id !== activeBox);
        handleUpdateContainer(updatedContainer);
        // setBoxSerializable(prev =>
        //     prev.map((container, index) =>
        //         index === selectedContainer ? updatedContainer : container
        //     )
        // );
        setBoxe(buildBoxes(updatedContainer));
    };
    useEffect(() => {
        console.log("Current Container id changed", currentContainerWithEverything.name);
        setBoxSerializable(prev =>
            prev.map((container, index) =>
                index === selectedContainer ? currentContainerWithEverything : container
            )
        );
    }, [currentContainerWithEverything.name, currentContainerWithEverything.isGoingToDisplay, currentContainerWithEverything.durationDisplay]);
    const handleUpdateBox = () => {
        const updatedContainer = currentContainer.map(box => box.id === activeBox ? selectedBox : box);
        handleUpdateContainer(updatedContainer);
        // setBoxSerializable(prev =>
        //     prev.map((container, index) =>
        //         index === selectedContainer ? updatedContainer : container
        //     )
        // ); // --------------------------------------------------------------------- here - i - work --------------------------------------------------------------------
        setBoxe(buildBoxes(updatedContainer));
        console.log("Update Box");
    };
    const handleUpdateContainer = (thecurrentcontainer) => {
        const updatedContainerWithEverything = { ...currentContainerWithEverything, boxes: thecurrentcontainer };
        setBoxSerializable(prev =>
            prev.map((container, index) =>
                index === selectedContainer ? updatedContainerWithEverything : container
            )
        );
        console.log("Update Container with everything");
    };
    const handleNewContainer = () => {
        console.log("New Container");
        const lastId = boxSerializable.length > 0
            ? Math.max(...boxSerializable.map(container => container.id))
            : 0;
        setBoxSerializable([...boxSerializable, { id: lastId + 1, name: "New Container", isGoingToDisplay: false, durationDisplay: 30, boxes: [] }]); // Creating new Container with default values
        setSelectedContainer(boxSerializable.length);
    };
    const handleDeleteContainer = () => {
        setBoxSerializable(boxSerializable.filter((container, index) => index !== selectedContainer))
    };
    const handleNewProp = () => {
        if (!newPropKey) return;
        const newProps = { ...(selectedBox.props || {}), [newPropKey]: newPropValue };
        const updatedBox = { ...selectedBox, props: newProps };
        setSelectedBox(updatedBox);
        const updatedContainer = currentContainer.map(box =>
        box.id === activeBox ? updatedBox : box
        );
        handleUpdateContainer(updatedContainer);
    };
    const handleDeleteProps = (key) => {
        const updatedProps = Object.entries(selectedBox.props).filter(([k]) => k !== key);
        const updatedBox = {...selectedBox, props: Object.fromEntries(updatedProps)};
        setSelectedBox(updatedBox);
        const updatedContainer = currentContainer.map(box =>
            box.id === activeBox ? updatedBox : box
        );
        handleUpdateContainer(updatedContainer);
    };

    const findNextAvailablePosition = (boxes, newWidth = 1, newHeight = 1, gridColumns, gridRows) => {
        const grid = Array.from({ length: gridRows }, () => Array(gridColumns).fill(false));
        for (const box of boxes) {
            for (let dy = 0; dy < box.height; dy++) {
                for (let dx = 0; dx < box.width; dx++) {
                    grid[(box.y - 1) + dy][(box.x - 1) + dx] = true;
                }
            }
        }
        for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridColumns; x++) {
                let canPlace = true;
                for (let dy = 0; dy < newHeight; dy++) {
                    for (let dx = 0; dx < newWidth; dx++) {
                        if (y + dy >= gridRows || x + dx >= gridColumns || grid[y + dy][x + dx]) {
                            canPlace = false;
                            break;
                        }
                    }
                }
                if (canPlace) {
                    return {x: x + 1, y: y + 1};
                }
            }
        }
        return null;
    };

    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <div className="h-[6vh] flex items-center gap-4 px-4">
                <button
                    className="btn h-full aspect-square rounded-md btn-ghost"
                    aria-label="Add"
                    onClick={handleNewContainer}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>
                <div className="dropdown w-[20%] h-full">
                    <label tabIndex={0} className="btn h-full w-full justify-between rounded-md">
                        <span className="truncate">Containers</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60 bg-slate-700">
                        {boxSerializable.map((container, index) => (
                            <li
                                key={index}
                                onClick={() => setSelectedContainer(index)}
                            >
                                <a className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                                    {container.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <button
                    className="btn h-full aspect-square rounded-md btn-ghost"
                    aria-label="Delete"
                    onClick={handleDeleteContainer}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                    </svg>
                </button>

                <div className="dropdown w-[20%] h-full">
                    <label tabIndex={0} className="btn h-full w-full justify-between rounded-md">
                        <span className="truncate">Dropdown B</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box mt-2 w-[20%]">
                        <li>
                            <a>Option A</a>
                        </li>
                        <li>
                            <a>Option B</a>
                        </li>
                        <li>
                            <a>Option C</a>
                        </li>
                    </ul>
                </div>
                <button
                    className="btn h-full aspect-square rounded-md btn-ghost"
                    aria-label="Add"
                    onClick={() => handleSave(boxSerializable)}
                >
                    Save
                </button>
            </div>
            <main className="h-[calc(100vh-10vh)] flex gap-4 p-4">
                <div className="w-[30%] flex flex-col gap-4">
                    <div className="flex-1 rounded-lg p-4 bg-base-100">
                        <input 
                        className="text-2xl font-bold bg-transparent border-none focus:outline-none" 
                        type="text" 
                        value={currentContainerWithEverything?.name || ""} 
                        onChange={(e) => setCurrentContainerWithEverything({...currentContainerWithEverything, name: e.target.value})} />
                        <h2 className="text-sm text-gray-500"> 
                            ID: {currentContainerWithEverything.id} 
                        </h2>
                        <div className="flex form-control w-full gap-2">
                            <label className="label">
                                <span className="label-text font-medium">Is Going to Display</span>
                            </label>
                            <input 
                            className="" 
                            type="checkbox" 
                            checked={currentContainerWithEverything?.isGoingToDisplay || false} 
                            onChange={(e) => setCurrentContainerWithEverything({...currentContainerWithEverything, isGoingToDisplay: e.target.checked})} />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Duration of the display</span>
                            </label>
                            <input 
                            className="input input-bordered input-primary w-full" 
                            type="number" 
                            value={currentContainerWithEverything?.durationDisplay || ""} 
                            onChange={(e) => setCurrentContainerWithEverything({...currentContainerWithEverything, durationDisplay: e.target.value})} />
                        </div>

                    </div>
                    <div className="flex-1 rounded-lg p-4 bg-base-100 overflow-y-auto">
                        {currentContainer.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <h2>Vous n'avez aucune box actuellement</h2><br />
                                <button
                                    onClick={handleNewBox}
                                    className="btn btn-primary"
                                >
                                    Ajouter une box
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">{activeBox}</h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="btn h-full aspect-square rounded-md btn-ghost"
                                            aria-label="Add"
                                            onClick={handleUpdateBox}
                                        >
                                            Apply
                                        </button>
                                        <button onClick={handleNewBox} className="btn btn-circle btn-primary btn-sm" title="Ajouter">+</button>
                                        <div className="dropdown dropdown-end">
                                            <label tabIndex={0} className="btn btn-circle btn-ghost btn-sm">
                                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                                    <circle cx="4" cy="10" r="2" />
                                                    <circle cx="10" cy="10" r="2" />
                                                    <circle cx="16" cy="10" r="2" />
                                                </svg>
                                            </label>
                                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 max-h-48 overflow-y-auto">
                                                {currentContainer.map((box) => (
                                                    <li
                                                        key={box.id}
                                                        style={{
                                                            gridColumn: `span ${box.width}`,
                                                            gridRow: `span ${box.height}`,
                                                        }}
                                                        onClick={() => setActiveBox(box.id)}
                                                    >
                                                        <a className="w-full h-full flex items-center justify-center rounded-2xl">
                                                            {box.id}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button className="btn btn-circle btn-error btn-sm" title="Supprimer" onClick={handleDeleteBox}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 11v6M14 11v6" />
                                                <rect x="9" y="3" width="6" height="3" rx="1" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">Width</span>
                                        </label>
                                        <input
                                            value={selectedBox?.width || ''}
                                            onChange={(e) => {
                                                setSelectedBox(
                                                    { ...selectedBox, width: e.target.value }
                                                );
                                            }}
                                            type="number" placeholder="width" className="input input-bordered input-primary w-full" />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">Height</span>
                                        </label>
                                        <input
                                            value={selectedBox?.height || ''}
                                            onChange={(e) => {
                                                setSelectedBox(
                                                    { ...selectedBox, height: e.target.value }
                                                );
                                            }}
                                            type="number"
                                            placeholder="height"
                                            className="input input-bordered input-primary w-full" />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">X</span>
                                        </label>
                                        <input
                                            value={selectedBox?.x || ''}
                                            onChange={(e) => {
                                                setSelectedBox(
                                                    { ...selectedBox, x: e.target.value }
                                                );
                                            }}
                                            type="number"
                                            placeholder="X"
                                            className="input input-bordered input-primary w-full" />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">Y</span>
                                        </label>
                                        <input
                                            value={selectedBox?.y || ''}
                                            onChange={(e) => {
                                                setSelectedBox(
                                                    { ...selectedBox, y: e.target.value }
                                                );
                                            }}
                                            type="number"
                                            placeholder="Y"
                                            className="input input-bordered input-primary w-full" />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">Content</span>
                                        </label>
                                        <select
                                            className="select select-bordered select-primary w-full"
                                            value={selectedBox?.type || ""}
                                            onChange={e => {
                                                setSelectedBox({ ...selectedBox, type: e.target.value });
                                            }}
                                        >
                                            <option value="">-- Choisir --</option>
                                            {Object.keys(registry).map((key) => (
                                                <option key={key} value={key}>
                                                    {key === "" ? "Balise vide" : key}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="divider">Props</div>
                                    <div className="flex items-center gap-2">
                                        <span>New props</span>
                                        <button onClick={() => setShowPropModal(true)} className="btn btn-circle btn-primary btn-sm" title="Ajouter">+</button>
                                    </div>

                                    {selectedBox?.props &&
                                        <div className="flex flex-wrap gap-4">
                                            {Object.entries(selectedBox.props).map(([key, value]) => (
                                                <div className="flex items-center gap-2" key={key}>
                                                    <label className="font-medium">{key}:</label>
                                                    <input value={value} onChange={(e) => {
                                                        setSelectedBox(
                                                            { ...selectedBox, props: { ...selectedBox.props, [key]: e.target.value } }
                                                        );
                                                    }} className="input input-bordered input-primary w-auto max-w-[120px]" placeholder="Props"></input>
                                                    <button className="btn btn-circle btn-error btn-sm" title="Supprimer" onClick={() => handleDeleteProps(key)}>
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 11v6M14 11v6" />
                                                            <rect x="9" y="3" width="6" height="3" rx="1" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    <Modal
                                        open={showPropModal}
                                        title="Ajouter un nouveau prop"
                                        onClose={() => {
                                            setShowPropModal(false);
                                            setNewPropKey("");
                                            setNewPropValue("");
                                        }}
                                    >
                                        <div className="form-control gap-2">
                                            <label className="label">Nom du prop</label>
                                            <input
                                                className="input input-bordered"
                                                value={newPropKey}
                                                onChange={(e) => setNewPropKey(e.target.value)}
                                                placeholder="Clé"
                                            />

                                            <label className="label mt-2">Valeur du prop</label>
                                            <input
                                                className="input input-bordered"
                                                value={newPropValue}
                                                onChange={(e) => setNewPropValue(e.target.value)}
                                                placeholder="Valeur"
                                            />

                                            <div className="modal-action">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => {
                                                        handleNewProp();
                                                        setShowPropModal(false);
                                                        setNewPropKey("");
                                                        setNewPropValue("");
                                                    }}
                                                >
                                                    Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </Modal>
                                    <Modal
                                        open={showNotEnoughSpaceForNewBoxModal}
                                        title="Pas assez de place"
                                        onClose={() => {
                                            setShowNotEnoughSpaceForNewBoxModal(false);
                                        }}
                                    >
                                        <div className="form-control gap-2">
                                            
                                        </div>
                                    </Modal>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="w-[70%] flex flex-col gap-4">
                    <div className="flex-1 rounded-lgbg-base-100">
                        <h2 className="text-lg font-semibold"></h2>
                    </div>
                    <div className="w-[100%] rounded-lg p-4 bg-base-100 h-[70%]">
                        <div className={`grid grid-cols-${gridColumn} grid-rows-${gridRow} gap-2 w-full h-full p-2`}>
                            {boxe.map((box, index) => (
                                <div
                                    key={index}
                                    className={`border border-gray-600 rounded-3xl flex justify-center items-center text-white font-bold shadow-md p-2 cursor-pointer transition-all duration-150 hover:scale-105 hover:border-blue-500 hover:bg-blue-900/30`}
                                    style={{
                                        gridColumn: `${box.x} / span ${box.width}`,
                                        gridRow: `${box.y} / span ${box.height}`,
                                    }}
                                    onClick={() => setActiveBox(box.id)}
                                >
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                                        {box.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}