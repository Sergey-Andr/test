import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import "./style.css";
import { IoHome } from "react-icons/io5";
import { LuChartSpline } from "react-icons/lu";
import { BsFillTelephoneFill } from "react-icons/bs";
import { useState } from "react";
import services from "../services.json";

const paginationModel = { page: 0, pageSize: 25 };

export default function DataTable() {
    const [isActive, setIsActive] = useState("home");
    const [language, setLanguage] = useState(localStorage.getItem("language"));

    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ID",
            minWidth: 40,
            maxWidth: 70,
            flex: 1,
        },
        {
            field: "name",
            headerName: language === "ua" ? "Назва" : "Name",
            minWidth: 100,
            flex: 1,
        },
        {
            field: language === "ua" ? "typeUA" : "typeEN",
            headerName: language === "ua" ? "Тип" : "Type",
            cellClassName: "wrap-text",
            minWidth: 130,
            flex: 1,
        },
        {
            field: language === "ua" ? "descriptionUA" : "descriptionEN",
            headerName: language === "ua" ? "Опис" : "Description",
            sortable: false,
            cellClassName: "wrap-text",
            minWidth: 270,
            flex: 2,
        },
        {
            field: "link",
            headerName: language === "ua" ? "Посилання" : "Link",
            sortable: false,
            minWidth: 160,
            flex: 1,
            renderCell: (params) => {
                return (
                    <a
                        href={params.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="linkToAISite"
                    >
                        {params.value}
                    </a>
                );
            },
        },
        {
            field: language === "ua" ? "priceUA" : "priceEN",
            headerName: language === "ua" ? "Ціна" : "Price",
            minWidth: 110,
            flex: 2,
        },
    ];

    const rows = services.map((service, id) => {
        return { ...service, id: ++id };
    });

    return (
        <div className="wrapper">
            <div className="top-line">
                <div className="top-line-logo">
                    <img
                        src={`${(import.meta as any).env.BASE_URL}logo.svg`}
                        className="logo"
                    />
                    <p style={{ color: "#fff" }}>Aish</p>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                    }}
                >
                    <button className="fake-btn">
                        {language === "ua" ? "Зареєструватися" : "Sign up"}
                    </button>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#fff",
                            fontSize: "12px",
                            marginRight: "16px",
                        }}
                    >
                        <p
                            style={{
                                color: `${language === "en" ? "#fff" : "#a3a3a3"}`,
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                localStorage.setItem("language", "en");
                                setLanguage("en");
                            }}
                        >
                            EN
                        </p>
                        <p
                            style={{
                                color: `${language === "ua" ? "#fff" : "#a3a3a3"}`,
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                localStorage.setItem("language", "ua");
                                setLanguage("ua");
                            }}
                        >
                            UA
                        </p>
                    </div>
                </div>
            </div>
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                }}
            >
                <div className="left-line">
                    <div
                        onClick={() => {
                            setIsActive("home");
                        }}
                        className={`fake-buttons-container ${isActive === "home" ? "fake-buttons-container-active" : ""}`}
                    >
                        <IoHome
                            className={`${isActive === "home" ? "fake-buttons-icon-fill-active" : ""} fake-button-icon`}
                        />
                    </div>
                    <div
                        onClick={() => {
                            setIsActive("charts");
                        }}
                        className={`fake-buttons-container ${isActive === "charts" ? "fake-buttons-container-active" : ""}`}
                    >
                        <LuChartSpline
                            className={`${isActive === "charts" ? "fake-buttons-icon-stroke-active" : ""} fake-button-icon-stroke`}
                            style={{
                                fill: "transparent",
                            }}
                        />
                    </div>
                    <div
                        onClick={() => {
                            setIsActive("phone");
                        }}
                        className={`fake-buttons-container ${isActive === "phone" ? "fake-buttons-container-active" : ""}`}
                    >
                        <BsFillTelephoneFill
                            className={`${isActive === "phone" ? "fake-buttons-icon-fill-active" : ""} fake-button-icon`}
                        />
                    </div>
                </div>
                <Paper className="datagrid-container" style={{ minWidth: 0 }}>
                    <h2 style={{ lineHeight: "16px" }}>
                        {language === "ua" ? "AI-сервіси" : "AI-services"}
                    </h2>
                    <DataGrid
                        rows={rows as []}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[5, 10]}
                        checkboxSelection
                        sx={{
                            border: 0,
                            color: "white",
                            background: "#1e1e1e",
                        }}
                    />
                </Paper>
            </div>
        </div>
    );
}
