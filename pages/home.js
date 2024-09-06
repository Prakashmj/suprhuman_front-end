import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/home.module.css";
import Footer from "./footer";
import FirstFifty from "./first-fifty";

export default function Home() {
  const router = useRouter();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [characterImage, setCharacterImage] = useState("/avatar1.png");
  const [energy, setEnergy] = useState({ current: 0, max: 1000 });
  const [timer, setTimer] = useState("00:00:00");
  const [coinsPerMinute, setCoinsPerMinute] = useState(0);
  const [coinsEarnToday, setCoinsEarnedToday] = useState(0);
  const [isFirstFiftyOpen, setIsFirstFiftyOpen] = useState(false);
  const [isEnergyIncreasing, setIsEnergyIncreasing] = useState(false);
  const [previousEnergy, setPreviousEnergy] = useState(0);
  const [coins, setCoins] = useState([]);

  const toggleSettingsModal = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  const handlePageTap = (e) => {
    const target = e.target;
    const isOnAvatar = target.classList.contains(styles.characterImage);
    const isOnBackground = target.classList.contains(styles.pageContainer);

    if (isOnAvatar || isOnBackground) {
      const x = e.clientX;
      const y = e.clientY;

      // Add a new coin to the array with a unique ID and initial position
      setCoins((prevCoins) => [
        ...prevCoins,
        { id: Date.now(), x, y },
      ]);

      // Remove the coin after 1 second
      setTimeout(() => {
        setCoins((prevCoins) => prevCoins.filter((coin) => coin.id !== Date.now()));
      }, 1000);
    }
  };

  useEffect(() => {
    const firstFiftyShown =
      typeof window !== "undefined" && localStorage.getItem("firstFiftyShown");

    if (!firstFiftyShown) {
      setIsFirstFiftyOpen(true);
      typeof window !== "undefined" &&
        localStorage.setItem("firstFiftyShown", "true");
    }

    // Retrieve coinsEarnedToday from localStorage
    const storedCoinsEarnedToday =
      typeof window !== "undefined" && localStorage.getItem("coinsEarnToday");
    if (storedCoinsEarnedToday) {
      setCoinsEarnedToday(Number(storedCoinsEarnedToday));
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
        const userId =
          typeof window !== "undefined" && localStorage.getItem("userId");

        if (userId) {
          const response = await axios.get(
            `http://88.222.242.108:8080/get/user/${userId}`
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

          const fetchedCoinsEarnedToday =
            Number(response.data.user.coinsEarnToday) || 0;
          setCoinsEarnedToday(fetchedCoinsEarnedToday);

          // Also update localStorage
          typeof window !== "undefined" &&
            localStorage.setItem("coinsEarnToday", fetchedCoinsEarnedToday);
        } else {
          console.warn("User ID not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateCoins = async () => {
      try {
        const userId =
          typeof window !== "undefined" && localStorage.getItem("userId");
        if (userId) {
          setCoinsEarnedToday((prevCoinsEarned) => {
            const newCoinsEarnedToday = prevCoinsEarned + coinsPerMinute;

            // Update localStorage
            typeof window !== "undefined" &&
              localStorage.setItem("coinsEarnToday", newCoinsEarnedToday);

            // Send PUT request to update coins earned today
            axios
              .put(
                `http://88.222.242.108:8080/update/coins/earntoday/${userId}`,
                {
                  coinsEarnToday: newCoinsEarnedToday,
                }
              )
              /////////////////////////////////////////////
              .catch((error) => {
                console.error("Error updating coins earned today:", error);
              });

            return newCoinsEarnedToday;
          });
        } else {
          console.warn("User ID not found in localStorage");
        }
      } catch (error) {
        console.error("Error updating coins:", error);
      }
    };

    const intervalId = setInterval(updateCoins, 60000); // Update every minute

    return () => clearInterval(intervalId);
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

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    // Check if energy has stopped decreasing
    if (energy.current >= previousEnergy) {
      setIsEnergyIncreasing(true);
    } else {
      setIsEnergyIncreasing(false);
    }

    setPreviousEnergy(energy.current);
  }, [energy.current]);

  useEffect(() => {
    if (isEnergyIncreasing) {
      const intervalId = setInterval(() => {
        setEnergy((prevEnergy) => {
          const newEnergy = Math.min(prevEnergy.current + 3, prevEnergy.max);
          return { ...prevEnergy, current: newEnergy };
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isEnergyIncreasing]);

  const handleCharacterImageClick = async () => {
    try {
      const userId =
        typeof window !== "undefined" && localStorage.getItem("userId");
      if (!userId) {
        console.warn("User ID not found in localStorage");
        return;
      }

      const response = await axios.put(
        `http://88.222.242.108:8080/update/coin/${userId}`
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
        console.error("Error updating coins:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating coins:", error);
    }
  };

  // Function to format numbers with thousands separators
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const formatNumber = (value) => {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + "m"; // 1.0m, 2.5m
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(1) + "k"; // 1.0k, 2.5k
    } else {
      return value; // No formatting for values less than 1000
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
        <p className={styles.coinsLabel}>{formatNumberWithCommas(coins)}</p>
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
            <p className={styles.coinsValue}>{formatNumber(coinsPerMinute)}</p>
          </div>
        </div>

        <div className={styles.boostContainer}>
          <div className={styles.boostTextContainer}>
            <p className={styles.boostLabel}>BOOST</p>
          </div>
          <div className={styles.boostIconContainer} onClick={() => router.push('boost')}>
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
          <p className={styles.coinsLabel2}>
            {formatNumberWithCommas(coinsEarnToday)}
          </p>
        </div>

        <div className={styles.timeContainer}>
          <p className={styles.timeLabel}>{timer}</p>
        </div>
      </div>

      {isSettingsOpen && <div className={styles.settingsModal}>Settings</div>}

      {isFirstFiftyOpen && <FirstFifty />}
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

                <button type="button" className={styles.actionButton1}>
                  CONNECT WALLET
                </button>
                <button type="button" className={styles.actionButton2} onClick={() => router.push('chooseCharacter')}>
                  CHANGE CHARACTER
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {isFirstFiftyOpen && (
        <FirstFifty onClose={() => setIsFirstFiftyOpen(false)} />
      )}

      {coins.map((coin) => (
        <img
          key={coin.id}
          src="/coins-per-min.png"
          alt="Coin per Tap"
          className={styles.coinPerTap}
          style={{ top: coin.y, left: coin.x }}
        />
      ))}
      
    </div>
  );
}
