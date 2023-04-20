import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Backdrop, CircularProgress } from "@mui/material";
import ReactApexChart from "react-apexcharts";

const Header = styled.div`
  width: 100%;
  height: 100px;
  background-color: #2b6652;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
`;

const HeaderTitle = styled.div`
  color: #d4cd9b;
  font-size: 3rem;
  font-weight: 900;
  margin-left: 100px;
`;

const PageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  padding-top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CustomP = styled.div`
  border: 1px solid black;
`;

const UploadBtn = styled.button`
  width: 400px;
  height: 100px;
  border: none;
  background-color: #2b6652;
  color: #d4cd9b;
  font-size: 40px;
  font-weight: 500;
  border-radius: 15px;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.5);
  &:hover {
    box-shadow: none;
  }
`;

const ResetBtn = styled.div`
  background-color: #2b6652;
  color: #d4cd9b;
  width: 300px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  font-weight: 500;
  border-radius: 12px;
`;

const GraphWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
`;

function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(0);
  const [pCategories, setPCategories] = useState([
    1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
  ]);
  const [nCategories, setNCategories] = useState([
    1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
  ]);
  const [pData, setPData] = useState([30, 40, 45, 50, 49, 60, 70, 91]);
  const [nData, setNData] = useState([30, 40, 45, 50, 49, 60, 70, 91]);

  const onReset = () => {
    window.location.reload();
  };

  const sortLabel = (a: any, b: any) => {
    if (a.value < b.value) {
      return 1;
    } else {
      return -1;
    }
  };
  const onTest = () => {
    const formData = new FormData();
    if (uploadedFiles) {
      formData.append("file", uploadedFiles);
    }
    setIsLoading(true);
    axios({
      method: "POST",
      url: `http://localhost:5000/run`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        console.log(response.data);
        const tempP = [...response.data.data.positive];
        const tempN = [...response.data.data.negative];
        tempP.sort(sortLabel);
        tempN.sort(sortLabel);
        const tempPCategories = [];
        const tempPData = [];
        const tempNCategories = [];
        const tempNData = [];

        for (const element of tempP) {
          tempPCategories.push(element.item);
          tempPData.push(element.value);
        }
        for (const element of tempN) {
          tempNCategories.push(element.item);
          tempNData.push(element.value);
        }
        setPCategories(tempPCategories);
        setPData(tempPData);
        setNCategories(tempNCategories);
        setNData(tempNData);
        setResult(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error(error);
      });
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    console.log(acceptedFiles);
    setIsSubmitted(true);
    setUploadedFiles(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const pState = {
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: pCategories,
      },
      title: {
        text: "Positive",
        style: {
          color: "#3FA0FC",
        },
      },
    },
    series: [
      {
        name: "series-1",
        data: pData,
      },
    ],
  };
  const nState = {
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: nCategories,
      },
      title: {
        text: "Negative",
        style: {
          color: "#E91E63",
        },
      },
      fill: {
        colors: ["#E91E63"],
      },
    },
    series: [
      {
        name: "series-1",
        data: nData,
      },
    ],
  };

  return (
    <div className="App">
      <Header>
        <HeaderTitle>카톡 분석기</HeaderTitle>
      </Header>
      <PageWrapper>
        {result ? (
          <GraphWrapper>
            <ReactApexChart
              options={pState.options}
              series={pState.series}
              type="bar"
              width="500"
            />
            <ReactApexChart
              options={nState.options}
              series={nState.series}
              type="bar"
              width="500"
            />
            <ResetBtn onClick={onReset}>다시하기</ResetBtn>
          </GraphWrapper>
        ) : isSubmitted ? (
          <UploadBtn onClick={onTest}>Test</UploadBtn>
        ) : (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <CustomP>Drop the files here ...</CustomP>
            ) : (
              <CustomP>
                Drag 'n' drop some files here, or click to select files
              </CustomP>
            )}
          </div>
        )}
      </PageWrapper>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;
