import { useEffect, useState } from "react";
import strikeZone from "./strikeZone.png";
import "./App.css";

function App() {
  const [filteredPitchData, setFilteredPitchData] = useState([]);

  // 繪製進壘點
  const drawerZone = (pitchData) => {
    if (pitchData?.TaggedPitchType) {
      // 定位好球帶中心
      const centerX = 50;
      const centerY = ((917 + (1604 - 917) / 2) / 2296) * 100;

      // 創建進壘點 DOM
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dot.classList.add(pitchData.TaggedPitchType);

      // 計算水平與垂直位移變量
      const xVar =
        (Number(pitchData.APP_KZoneY) / 10) *
        (((1576 - 1001) / 2 / 2583) * 100);
      const yVar =
        ((30 - Number(pitchData.APP_KZoneZ)) / 24) *
        (((1604 - 917) / 2296) * 100);
      dot.style.left = `calc(${centerX + xVar}% - 5px)`;
      dot.style.top = `calc(${centerY + yVar}% - 5px)`;

      const zone = document.querySelector(".strikeZone");
      zone.appendChild(dot);
    }
  };

  // 球種分類
  const classifyPitchData = (data) => {
    const fb = {
      pitchTypeName: "FB",
      data: [],
    };
    const cb = {
      pitchTypeName: "CB",
      data: [],
    };
    const ch = {
      pitchTypeName: "CH",
      data: [],
    };
    const ft = {
      pitchTypeName: "FT",
      data: [],
    };
    const sl = {
      pitchTypeName: "SL",
      data: [],
    };
    const sp = {
      pitchTypeName: "SP",
      data: [],
    };
    const ct = {
      pitchTypeName: "CT",
      data: [],
    };
    const sff = {
      pitchTypeName: "SFF",
      data: [],
    };
    const kn = {
      pitchTypeName: "KN",
      data: [],
    };
    const sc = {
      pitchTypeName: "SC",
      data: [],
    };

    for (let i = 0; i < data.length; i++) {
      const pitch = data[i];
      // 繪圖
      drawerZone(pitch);
      switch (pitch.TaggedPitchType) {
        case "FB":
          fb.data.push(pitch);
          break;
        case "CB":
          cb.data.push(pitch);
          break;
        case "CH":
          ch.data.push(pitch);
          break;
        case "FT":
          ft.data.push(pitch);
          break;
        case "SL":
          sl.data.push(pitch);
          break;
        case "SP":
          sp.data.push(pitch);
          break;
        case "CT":
          ct.data.push(pitch);
          break;
        case "SFF":
          sff.data.push(pitch);
          break;
        case "KN":
          kn.data.push(pitch);
          break;
        case "SC":
          sc.data.push(pitch);
          break;
        default:
          break;
      }
    }

    return [fb, cb, ch, ct, ft, sl, sp, sff, kn, sc].filter(
      (arr) => arr.data.length > 0
    );
  };

  // 取得投球資料
  const fetchPitchData = async () => {
    const data = await fetch('https://statsinsight-code-interview.herokuapp.com/get/Get_Balls_CI')
      .then((response) => {
        return response.json()
      })

    const result = classifyPitchData(data);
    setFilteredPitchData(result);
  };

  // 平均球速
  const averageSpeed = (data) => {
    let sum = 0
    let validSpeedCount = 0
    data.forEach(({ APP_VeloRel }) => {
      if (APP_VeloRel) {
        validSpeedCount++
        sum += Number(APP_VeloRel)
      }
    })
    const average = (sum / validSpeedCount).toFixed(1);
    return average % 1 === 0 ? Math.round(average) : average;
  };

  // 好球率
  const strikePetcentage = (data) => {
    let strike = 0;
    let ball = 0;
    data.forEach((pitch) => {
      if (pitch.PitchCode === "Ball") {
        ball++;
      } else {
        strike++;
      }
    });
    return Math.round((strike / (strike + ball)) * 100);
  };

  // BABIP
  const getBABIP = (data) => {
    let ipExceptHR = 0;
    let h = 0;
    data.forEach(({ PitchCode, PlayResult }) => {
      // 計算球打進場內扣除全壘打與犧牲觸擊的次數
      if (
        PitchCode === "In-Play" &&
        PlayResult !== "HR" &&
        PlayResult !== "SH"
      ) {
        ipExceptHR++;
      }

      // 計算全壘打以外安打數
      if (PlayResult === "1B" || PlayResult === "2B" || PlayResult === "3B") {
        h++;
      }
    });

    const babip = (h / ipExceptHR).toFixed(3);

    return isNaN(babip) ? "-" : babip;
  };

  useEffect(() => {
    fetchPitchData();
  }, []);

  return (
    <div className="App">
      <div className="pitchTypeTabel">
        <table>
          <thead>
            <tr>
              <th>球種</th>
              <th>球數</th>
              <th>平均球速</th>
              <th>好球率</th>
              <th>BABIP</th>
            </tr>
          </thead>
          <tbody>
            {filteredPitchData.map((pitchGroup, index) => (
              <tr key={index}>
                <td>{pitchGroup.pitchTypeName}</td>
                <td>{pitchGroup.data.length}</td>
                <td>{averageSpeed(pitchGroup.data)}</td>
                <td>{strikePetcentage(pitchGroup.data)}</td>
                <td>{getBABIP(pitchGroup.data)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="strikeZone">
        <img src={strikeZone} alt="" />
      </div>
    </div>
  );
}

export default App;
