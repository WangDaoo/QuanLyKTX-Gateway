using Microsoft.AspNetCore.Mvc;
using KTX_NguoiDung.Models;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/home")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok(new { success = true, data = new { status = "ok" } });
    }
}


