import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/home.module.css";
import Footer from "./footer";
import FirstFifty from "./first-fifty";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [coinPosition, setCoinPosition] = useState(null);
  const [coins, setCoins] = useState(0); // State for coins
  const [characterImage, setCharacterImage] = useState("/avatar1.png");
  const [energy, setEnergy] = useState({ current: 0, max: 1000 });
  const [timer, setTimer] = useState("00:00:00");
  const [coinsPerMinute, setCoinsPerMinute] = useState(0);
  const [coinsEarnedToday, setCoinsEarnedToday] = useState(0); // State for coins earned today
  const [isFirstFiftyOpen, setIsFirstFiftyOpen] = useState(false);

  const toggleSettingsModal = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  // Function to handle tap and show the coin image
  const handlePageTap = (e) => {
    const target = e.target;

    const isOnAvatar = target.classList.contains(styles.characterImage);
    const isOnBackground = target.classList.contains(styles.pageContainer);

    if (isOnAvatar || isOnBackground) {
      const x = e.clientX;
      const y = e.clientY;
      setCoinPosition({ x, y });

      setTimeout(() => setCoinPosition(null), 1000);
    }
  };
  ///////////////////////////////////////////////// fisrt fifty populate usefeffect /////////////////////////////////////////////
  useEffect(() => {
    const isFirstFifty = true;

    if (isFirstFifty) {
      setIsFirstFiftyOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("click", handlePageTap);
    return () => {
      window.removeEventListener("click", handlePageTap);
    };
  }, []);

  // Fetch coins, character image, and energy data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (userId) {
          const response = await axios.get(
            `http://localhost:8080/get/user/${userId}`
          );

          const fetchedCoins = Number(response.data.user.signupCoin) || 0;
          setCoins(fetchedCoins);

          const fetchedCharacterImage =
            response.data.user.characterImage || "/avatar1.png";
          setCharacterImage(fetchedCharacterImage);

          const fetchedEnergy = response.data.user.energy || {
            current: 0,
            max: 1000,
          };
          setEnergy(fetchedEnergy);

          const fetchedCoinsPerMinute = response.data.user.coinsPerMinute || 0;
          setCoinsPerMinute(fetchedCoinsPerMinute);
        } else {
          console.warn("User ID not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Update coins and coinsEarnedToday every minute
  useEffect(() => {
    const updateCoins = () => {
      setCoins((prevCoins) => prevCoins + coinsPerMinute);
      setCoinsEarnedToday(
        (prevCoinsEarned) => prevCoinsEarned + coinsPerMinute
      );
    };

    const intervalId = setInterval(updateCoins, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [coinsPerMinute]);

  // Update timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimer(`${hours}:${minutes}:${seconds}`);
    };

    const intervalId = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(intervalId);
  }, []);

  const handleCharacterImageClick = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("User ID not found in localStorage");
        return;
      }

      // Optional: Add request body if required by your server
      const requestBody = {}; // Replace with actual data if needed

      const response = await axios.put(
        `http://localhost:8080/update/coin/${userId}`,
        requestBody
      );

      if (response.status === 200) {
        const updatedUser = response.data.updatedUser;
        if (updatedUser) {
          const updatedCoins = Number(updatedUser.signupCoin) || 0;
          setCoins(updatedCoins);

          const updatedEnergy = updatedUser.energy || { current: 0, max: 1000 };
          setEnergy(updatedEnergy);
        } else {
          console.error("Updated user data is missing in the response");
        }
      } else {
        console.error(
          `Error updating coins: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error(
        "Error updating coins:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className={styles.pageContainer} onClick={handlePageTap}>
      <div className={styles.header}>
        <h1 className={styles.heading}>
          <span className={styles.supr}>SUPR</span>
          <span className={styles.human}>HUMAN</span>
        </h1>
        <img
          src="/settings.png"
          alt="Settings"
          className={styles.settingsIcon}
          onClick={toggleSettingsModal}
        />
      </div>

      <div className={styles.coinsContainer}>
        <p className={styles.coinsLabel}>{coins}</p>
      </div>

      <div className={styles.characterContainer}>
        <div className={styles.superBoostContainer}>
          <div className={styles.superBoostTextContainer}>
            <p className={styles.superBoostLabel}>
              <span className={styles.superText}>SUPR</span>
              <span className={styles.boostText}>BOOST</span>
            </p>
            <p className={styles.comingSoon}>(coming soon)</p>
          </div>
          <div className={styles.superBoostIconContainer}>
            <img
              src="/superboost-home.png"
              alt="Superboost"
              className={styles.superBoostIcon}
            />
          </div>
        </div>

        <div className={styles.coinsPerMinContainer}>
          <div className={styles.coinsPerMinIconContainer}>
            <img
              src="/coins-per-min.png"
              alt="Coins Per Min"
              className={styles.coinsPerMinIcon}
            />
          </div>
          <div className={styles.coinsPerMinTextContainer}>
            <p className={styles.coinsPerMinLabel}>COINS/MIN</p>
            <p className={styles.coinsValue}>{coinsPerMinute}</p>
          </div>
        </div>

        <div className={styles.boostContainer}>
          <div className={styles.boostTextContainer}>
            <p className={styles.boostLabel}>BOOST</p>
          </div>
          <div className={styles.boostIconContainer}>
            <img src="/boost.png" alt="Boost" className={styles.boostIcon} />
          </div>
        </div>

        <div className={styles.energyContainer}>
          <div className={styles.energyIconContainer}>
            <p className={styles.energyLabel}>ENERGY</p>
            <p className={styles.energyValue}>
              {energy.current}/{energy.max}
            </p>
          </div>
        </div>
        <img
          src={characterImage}
          alt="Character"
          className={styles.characterImage}
          onClick={handleCharacterImageClick}
        />

        <p className={styles.coinsEarned}>COINS EARNED TODAY</p>

        <div className={styles.valueContainer}>
          <p className={styles.coinsLabel2}>{coinsEarnedToday}</p>
        </div>

        <div className={styles.timeContainer}>
          <p className={styles.timeLabel}>{timer}</p>
        </div>
      </div>

      <Footer />

      {isSettingsOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={toggleSettingsModal}
            >
              <img src="/cross.png" alt="Close" />
            </button>
            <div className={styles.formContainer}>
              <form>
                <label htmlFor="name" className={styles.label}>
                  NAME
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="NAME"
                  className={styles.inputField}
                />

                <label htmlFor="gender" className={styles.label}>
                  GENDER
                </label>
                <select id="gender" className={styles.selectField}>
                  <option value="" disabled hidden>
                    Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <label htmlFor="dob" className={styles.label}>
                  DATE OF BIRTH
                </label>
                <input
                  type="date"
                  id="dob"
                  placeholder="DATE OF BIRTH"
                  className={styles.inputField}
                />

                <label htmlFor="email" className={styles.label}>
                  EMAIL
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="EMAIL"
                  className={styles.inputField}
                />

                <label htmlFor="phone" className={styles.label}>
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="PHONE NUMBER"
                  className={styles.inputField}
                />

                <button type="submit" className={styles.submitButton}>
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {isFirstFiftyOpen && (
        <FirstFifty onClose={() => setIsFirstFiftyOpen(false)} />
      )}

      {coinPosition && (
        <img
          src="/coins-per-min.png"
          alt="Coin per Tap"
          className={styles.coinPerTap}
          style={{ top: coinPosition.y, left: coinPosition.x }}
        />
      )}
    </div>
  );
}