import axios from "axios";
import { useEffect, useState } from "react";
import { FormControl, Form, FormSelect } from "react-bootstrap";
import { FaSkullCrossbones } from "react-icons/fa6";
import { LuHeartPulse } from "react-icons/lu";
import { GrStatusUnknown } from "react-icons/gr";
import { Character } from "./interfaces/Character";
import { FaHeartCirclePlus } from "react-icons/fa6";
import { FaHeartCircleMinus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledFilterSelect = styled.select`
  background-color: #f0f0f0; /* Arka plan rengi */
  color: #333; /* Yazı rengi */
  padding: 10px; /* İç boşluk */
  border-radius: 5px; /* Kenar yuvarlama */
  &:hover {
    background-color: #e0e0e0; /* Üzerine gelindiğinde arka plan rengi */
  }
`;

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchCharacter, setSearchCharacter] = useState<string>("");
  const [favori, setFavori] = useState<number>(0);
  const [filterMale, setFilterMale] = useState<string>("");

  useEffect(() => {
    const favorites: Character[] = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );
    setFavori(favorites.length);
  }, [characters]);

  useEffect(() => {
    const getAllCharacters = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://rickandmortyapi.com/api/character?limit=10&page=2"
        );
        const data = await response.data.results;
        setCharacters(data);
        setLoading(false);
      } catch (error) {
        console.error("API Hatası var kardeşim " + error);
        setLoading(false);
      }
    };

    getAllCharacters();
  }, []);

  const addToFavorites = (character: Character): void => {
    const favorites: Character[] = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );

    if (!favorites.some((fav) => fav.id === character.id)) {
      favorites.push(character); // Eğer karakter favorilerde yoksa ekle
      sessionStorage.setItem("favorites", JSON.stringify(favorites));
    }
  };

  const removeFromFavorites = (id: number): void => {
    const favorites: Character[] = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );
    // Silmek istedigimiz ürün filtrelemeye girer eşit olmayan ürünler dizide kalır ve eşit olanı diziden çıkartarak silmiş olur
    const updatedFavorites: Character[] = favorites.filter(
      (fav) => fav.id !== id
    );
    // Yeni Haliyle Güncelliyoruz
    sessionStorage.setItem("favorites", JSON.stringify(updatedFavorites)); // Favorilerden çıkar
  };

  // Dışarıdan gelen id eger bizim storagedeki ürünlerin içlerinde varsa true yoksa false döner
  const characterIsFavorite = (id: number): boolean => {
    const favorites: Character[] = JSON.parse(
      sessionStorage.getItem("favorites") || "[]"
    );
    return favorites.some((fav) => fav.id === id);
  };

  // Favoriye ekleme ve çıkarma
  const handleFavoriteClick = (character: Character) => {
    // Dışaradn gelen karakter kontrole girer ve eger var ise characterIsfavorite'den true döner ve ürün oldugu için çıkarma işlemini yapar
    if (characterIsFavorite(character.id)) {
      removeFromFavorites(character.id); // Favoriden çıkar
      alert("Favoriden Kaldırıldı");
    }
    // Eger False dönerse yani ürün yok ise ürünü yeni eklemiş oluyor
    else {
      addToFavorites(character); // Favoriye ekle
      confetti();
    }
    // Tekrardan güncelliyoruz
    setCharacters([...characters]); //Stati setliyoruz
  };

  const searchCharacters = characters.filter((character) => {
    const nameMatch = character.name
      .toLowerCase()
      .includes(searchCharacter.toLowerCase());

    if (filterMale === "male") {
      return nameMatch && character.gender === "Male";
    } else if (filterMale === "female") {
      return nameMatch && character.gender === "Female";
    }

    return nameMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <h2 className="title">TypeScript Rick Morty Api</h2>
        <Form>
          <FormControl
            type="text"
            value={searchCharacter}
            placeholder="Search Characters....."
            className="input my-5"
            onChange={(e) => setSearchCharacter(e.target.value)}
          />
        </Form>
        <Form>
          <StyledFilterSelect
            value={filterMale}
            onChange={(e) => setFilterMale(e.target.value)}
          >
            <option defaultChecked>Cinsiyet</option>
            <option value="female">Kadın</option>
            <option value="male">Erkek</option>
          </StyledFilterSelect>
        </Form>
      </div>
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap justify-center">
          {searchCharacters.map(
            ({ gender, image, id, name, location, status }) => (
              <div
                className="flex text-center align-middle col sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 p-2"
                key={id}
              >
                <div className="max-w-sm card shadow-2xl border  rounded-xl dark:bg-gray-800 dark:border-gray-700">
                  <img className="image" src={image} alt="Karakter fotografı" />
                  <div className="p-5 body my-1">
                    <p className="mb-4 font-bold text-lg ">{name}</p>
                    <p className="mb-4 font-bold text-lg ">
                      Adres:{" "}
                      {location.name === "unknown"
                        ? "Adres Bulunamadı"
                        : location.name}
                    </p>
                    <p className="mb-4 font-bold text-lg ">
                      Cinsiyet :
                      <span style={{ color: "#ffc2a3" }}>
                        {gender == "Male" ? "Erkek" : "Kadın"}
                      </span>
                    </p>
                    <p className="mb-3 font-bold text-lg flex justify-center">
                      <span>Yaşıyormu : </span>
                      {(() => {
                        // Status Kontrolüne göre deger döndürme
                        switch (status) {
                          case "Alive":
                            return (
                              <LuHeartPulse className="icon text-red-600" />
                            );
                          case "Dead":
                            return <FaSkullCrossbones className="icon" />;
                          case "unknown":
                            return (
                              <GrStatusUnknown className="icon-unknown " />
                            );
                        }
                      })()}
                    </p>
                  </div>
                  <div
                    onClick={() =>
                      handleFavoriteClick({
                        id,
                        gender,
                        image,
                        name,
                        location,
                        status,
                      })
                    }
                    className="favorite-icon"
                  >
                    {characterIsFavorite(id) ? (
                      <FaHeartCircleMinus className="favorite-icon" />
                    ) : (
                      <FaHeartCirclePlus className="favorite-icon-two" />
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {favori && (
        <div className="favorited-length">
          <Link to="/favorites-characters">Favori Karakterler: {favori}</Link>
        </div>
      )}
    </>
  );
}

export default App;
