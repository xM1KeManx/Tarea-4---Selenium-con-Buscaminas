import os
import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:8000/html"  # Ajusta según dónde sirvas tu proyecto

class BuscaMinasTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Ruta opcional a ChromeDriver si no está en el PATH
        driver_path = r"C:\chromedriver\chromedriver.exe"  # cámbialo si está en otra ruta
        cls.driver = webdriver.Chrome(driver_path)
        cls.driver.maximize_window()
        cls.screenshots_dir = "screenshots"
        os.makedirs(cls.screenshots_dir, exist_ok=True)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def take_screenshot(self, name):
        path = os.path.join(self.screenshots_dir, f"{int(time.time())}_{name}.png")
        self.driver.save_screenshot(path)
        print("Screenshot:", path)

    def test_1_login_correcto(self):
        d = self.driver
        d.get(f"{BASE_URL}/index.html")
        WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "user"))).send_keys("admin")
        d.find_element(By.ID, "pass").send_keys("1234")
        d.find_element(By.ID, "btnLogin").click()
        WebDriverWait(d, 8).until(EC.url_contains("juego.html"))
        user_text = WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "currentUser"))).text
        self.assertIn("admin", user_text)
        self.take_screenshot("login_correcto")

    def test_2_login_incorrecto(self):
        d = self.driver
        d.get(f"{BASE_URL}/index.html")
        WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "user"))).send_keys("noexisto")
        d.find_element(By.ID, "pass").send_keys("wrongpass")
        d.find_element(By.ID, "btnLogin").click()
        msg_text = WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "msg"))).text.lower()
        self.assertTrue("incorrect" in msg_text or "incorrecto" in msg_text)
        self.take_screenshot("login_incorrecto")

    def test_3_registro_usuario_nuevo(self):
        uname = f"user{int(time.time())}"
        pword = "pass123"
        d = self.driver
        d.get(f"{BASE_URL}/register.html")
        WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "r_user"))).send_keys(uname)
        d.find_element(By.ID, "r_pass").send_keys(pword)
        d.find_element(By.ID, "btnRegister").click()
        WebDriverWait(d, 8).until(EC.url_contains("juego.html"))
        user_text = WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "currentUser"))).text
        self.assertIn(uname, user_text)
        self.take_screenshot("registro_usuario_nuevo")

    def test_4_colocar_bandera(self):
        d = self.driver
        # Login con admin
        d.get(f"{BASE_URL}/index.html")
        WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "user"))).send_keys("admin")
        d.find_element(By.ID, "pass").send_keys("1234")
        d.find_element(By.ID, "btnLogin").click()
        WebDriverWait(d, 8).until(EC.url_contains("juego.html"))

        first_cell = WebDriverWait(d, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".cell")))
        actions = ActionChains(d)
        # Click derecho -> bandera
        actions.context_click(first_cell).perform()
        time.sleep(0.5)
        self.assertTrue("flag" in first_cell.get_attribute("class") or "🚩" in first_cell.text)
        # Click derecho -> interrogación
        actions.context_click(first_cell).perform()
        time.sleep(0.3)
        self.assertTrue("question" in first_cell.get_attribute("class") or "❓" in first_cell.text)
        # Click derecho -> none
        actions.context_click(first_cell).perform()
        time.sleep(0.3)
        self.assertFalse("flag" in first_cell.get_attribute("class") or "question" in first_cell.get_attribute("class"))
        self.take_screenshot("colocar_bandera")

    def test_5_enviar_comentario(self):
        uname = f"cmt{int(time.time())}"
        pword = "1234"
        d = self.driver
        # Registro rápido
        d.get(f"{BASE_URL}/register.html")
        WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "r_user"))).send_keys(uname)
        d.find_element(By.ID, "r_pass").send_keys(pword)
        d.find_element(By.ID, "btnRegister").click()
        WebDriverWait(d, 8).until(EC.url_contains("juego.html"))

        comment_text = f"Comentario prueba {int(time.time())}"
        WebDriverWait(d, 5).until(EC.presence_of_element_located((By.ID, "commentTxt"))).send_keys(comment_text)
        d.find_element(By.ID, "sendComment").click()
        time.sleep(1)
        comments = d.find_elements(By.CSS_SELECTOR, ".comment-item")
        found = any(comment_text in c.get_attribute("innerHTML") for c in comments)
        self.assertTrue(found, "El comentario no apareció en la lista")
        self.take_screenshot("enviar_comentario")

if __name__ == "__main__":
    unittest.main()
